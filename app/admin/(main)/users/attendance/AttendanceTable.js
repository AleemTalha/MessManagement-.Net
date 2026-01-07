"use client";
import { useState, useEffect } from "react";
import { useAttendance, useSaveAttendance } from "@/utils/useAttendance";
import { useSchedule } from "@/utils/useSchedule";
import { Clock } from "lucide-react";
import { toast } from "react-toastify";
import TimeDebugger from "./ui/TimeDebugger";
import AttendanceHeader from "./ui/AttendanceHeader";
import AttendanceTableBody from "./ui/AttendanceTableBody";
import AttendanceLegend from "./ui/AttendanceLegend";

const AttendanceTable = ({ month, year, page, limit, onPageChange }) => {
  const {
    data,
    isLoading: isAttendanceLoading,
    isError: isAttendanceError,
    error: attendanceError,
    refetch,
  } = useAttendance(month, year, page, limit);
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    error: scheduleError,
  } = useSchedule();
  const saveAttendance = useSaveAttendance();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editableAttendance, setEditableAttendance] = useState({});
  const [serverAttendance, setServerAttendance] = useState({});
  const [balanceChanges, setBalanceChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [debugTime, setDebugTime] = useState(null);

  const isLoading = isAttendanceLoading || isScheduleLoading;
  const isError = isAttendanceError || isScheduleError;
  const error = attendanceError || scheduleError;

  const now = debugTime || new Date();
  const currentDate = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentHour = now.getHours();
  const isCurrentMonth = month === currentMonth && year === currentYear;

  const isBeforeMorningTime = currentHour < 6;
  const isMorningTime = currentHour >= 6 && currentHour < 15;
  const isEveningTime = currentHour >= 15;

  const isReadOnly = data?.isReadOnly || !isCurrentMonth;
  const daysInMonth = data?.daysInMonth || 0;

  const getCurrentPeriod = () => {
    if (isBeforeMorningTime) return "none";
    if (isMorningTime) return "morning";
    if (isEveningTime) return "evening";
    return "none";
  };

  const currentEditablePeriod = getCurrentPeriod();

  const getMealPriceFromSchedule = (mealType) => {
    if (!scheduleData) return 0;
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = days[now.getDay()];
    const daySchedule = scheduleData[dayOfWeek];
    if (!daySchedule) return 0;
    return mealType === "morning"
      ? daySchedule.morningMeal?.price || 0
      : daySchedule.eveningMeal?.price || 0;
  };

  const handleSaveAttendance = async () => {
    if (!hasChanges || isReadOnly || currentEditablePeriod === "none") return;

    setIsSaving(true);
    try {
      const attendance = Object.entries(editableAttendance).map(
        ([index, values]) => {
          const update = {
            userId: data.attendanceData[parseInt(index)].userId,
            morningStatus: null,
            eveningStatus: null,
          };
          if (currentEditablePeriod === "morning")
            update.morningStatus = values.morning;
          else if (currentEditablePeriod === "evening")
            update.eveningStatus = values.evening;
          return update;
        }
      );

      await saveAttendance.mutateAsync({
        month,
        year,
        day: currentDate,
        attendance,
      });

      // Refetch data to get updated bills from backend
      await refetch();

      // Reset local state
      setBalanceChanges({});
      setHasChanges(false);
      setEditableAttendance({});
      setServerAttendance({});

      toast.success("Attendance and bills saved successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error?.message || "Failed to save attendance", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (data?.attendanceData && isCurrentMonth && !isReadOnly) {
      const initialAttendance = {};
      const initialBalanceChanges = {};
      const originalServerData = {};
      const mealPrice = getMealPriceFromSchedule(currentEditablePeriod);
      let autoMarkedCount = 0;

      data.attendanceData.forEach((user, userIndex) => {
        const morningStatus = user.morningAttendance[currentDate - 1];
        const eveningStatus = user.eveningAttendance[currentDate - 1];
        
        // Store original backend data
        originalServerData[userIndex] = {
          morning: morningStatus,
          evening: eveningStatus,
        };

        // Initialize editable attendance with backend data
        initialAttendance[userIndex] = {
          morning: morningStatus,
          evening: eveningStatus,
        };

        // Auto-mark current period as present ONLY if not already marked and period is active
        if (currentEditablePeriod !== "none") {
          const currentPeriodStatus = currentEditablePeriod === "morning" ? morningStatus : eveningStatus;
          
          // Only auto-mark if the current period is completely unmarked (null/undefined/empty)
          if (!currentPeriodStatus || currentPeriodStatus === '') {
            // Auto-mark as present in editable state
            initialAttendance[userIndex][currentEditablePeriod] = "p";
            // Calculate balance change from original state (was unmarked, now present)
            initialBalanceChanges[userIndex] = mealPrice;
            autoMarkedCount++;
          }
        }
      });

      setEditableAttendance(initialAttendance);
      // IMPORTANT: Store ORIGINAL backend data, not auto-marked data
      setServerAttendance(originalServerData);
      setBalanceChanges(initialBalanceChanges);
      setHasChanges(Object.keys(initialBalanceChanges).length > 0);

      // Show toast notification if any students were auto-marked
      if (autoMarkedCount > 0) {
        toast.info(
          `Auto-marked ${autoMarkedCount} student${autoMarkedCount > 1 ? 's' : ''} as present for ${currentEditablePeriod} period`,
          { position: "top-right", autoClose: 3000 }
        );
      }
    }
  }, [data, isCurrentMonth, currentDate, isReadOnly, currentEditablePeriod]);

  useEffect(() => {
    if (!isCurrentMonth || isReadOnly || currentEditablePeriod === "none") {
      setHasChanges(false);
      return;
    }

    const actualChanges = Object.keys(editableAttendance).some((userIndex) => {
      const edited = editableAttendance[userIndex];
      const server = serverAttendance[userIndex];
      if (!edited || !server) return false;

      if (currentEditablePeriod === "morning")
        return edited.morning !== server.morning;
      else if (currentEditablePeriod === "evening")
        return edited.evening !== server.evening;
      return false;
    });

    setHasChanges(actualChanges);
  }, [
    editableAttendance,
    serverAttendance,
    isCurrentMonth,
    isReadOnly,
    currentEditablePeriod,
  ]);

  const handleAttendanceClick = (userIndex, day, mealType) => {
    if (
      !isCurrentMonth ||
      isReadOnly ||
      day !== currentDate ||
      currentEditablePeriod === "none" ||
      mealType !== currentEditablePeriod
    )
      return;

    const user = data.attendanceData[userIndex];
    const currentStatus = editableAttendance[userIndex]?.[mealType];
    const originalStatus = serverAttendance[userIndex]?.[mealType];
    const newStatus = currentStatus === "p" ? "a" : "p";
    const mealPrice = getMealPriceFromSchedule(mealType);

    // Calculate total balance change from original server state
    let totalBalanceChange = 0;
    
    // The balance change is the difference between new status and original status
    if (newStatus === "p" && originalStatus !== "p") {
      // Now present but wasn't originally: add meal price
      totalBalanceChange = mealPrice;
    } else if (newStatus === "a" && originalStatus === "p") {
      // Now absent but was originally present: remove meal price
      totalBalanceChange = -mealPrice;
    }
    // If new status equals original status, no change

    setEditableAttendance((prev) => ({
      ...prev,
      [userIndex]: { ...prev[userIndex], [mealType]: newStatus },
    }));
    setBalanceChanges((prev) => ({ ...prev, [userIndex]: totalBalanceChange }));

    toast.info(
      `${user.userName}: ${
        newStatus === "p" 
          ? `Meal consumed - PKR ${mealPrice} added to bill` 
          : `Marked absent - ${originalStatus === "p" ? `PKR ${mealPrice} removed from bill` : "No charge"}`
      }`,
      { position: "top-right", autoClose: 2000 }
    );
  };

  const getAttendanceStatus = (day, status, userIndex, mealType) => {
    const isToday = isCurrentMonth && day === currentDate;
    const isPast = isCurrentMonth && day < currentDate;
    const isFuture = isCurrentMonth && day > currentDate;

    if (isToday && editableAttendance[userIndex])
      status = editableAttendance[userIndex][mealType];

    const isClickable =
      isToday &&
      !isReadOnly &&
      currentEditablePeriod !== "none" &&
      mealType === currentEditablePeriod;

    if (status === "p")
      return {
        bg: isToday ? "bg-green-600" : "bg-green-300",
        text: "P",
        textColor: "text-white",
        clickable: isClickable,
        tooltip: isToday ? undefined : "Present",
      };
    if (status === "a")
      return {
        bg: isToday ? "bg-orange-500" : "bg-orange-300",
        text: "A",
        textColor: "text-white",
        clickable: isClickable,
        tooltip: isToday ? undefined : "Absent",
      };
    
    // For today's current period with no status yet, make it clickable
    if (isClickable) {
      return {
        bg: "bg-blue-100",
        text: "?",
        textColor: "text-blue-700",
        clickable: true,
        tooltip: undefined,
      };
    }
    
    // For past days or non-current periods
    return {
      bg: isPast ? "bg-slate-50" : "bg-slate-100",
      text: "—",
      textColor: "text-slate-400",
      clickable: false,
      tooltip: isToday ? undefined : (isFuture ? "Future date" : isPast ? "Past period" : "Not current period"),
    };
  };

  const getPeriodBadge = () => {
    if (isBeforeMorningTime)
      return (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded border border-slate-300 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Before Morning
        </span>
      );
    if (isMorningTime)
      return (
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded border border-blue-300 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Morning
        </span>
      );
    if (isEveningTime)
      return (
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded border border-purple-300 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Evening
        </span>
      );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  if (isError)
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-red-200">
        <div className="text-center">
          <p className="text-red-700 font-semibold text-lg">
            Error Loading Data
          </p>
          <p className="text-sm text-red-600 mt-2">{error?.message}</p>
        </div>
      </div>
    );
  if (!data?.attendanceData?.length)
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200">
        <p className="text-slate-500 text-lg">No attendance data available</p>
      </div>
    );

  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-slate-50 p-2 overflow-auto"
          : "w-full"
      }`}
    >
      {/* <TimeDebugger debugTime={debugTime} setDebugTime={setDebugTime} /> */}
      <AttendanceHeader
        page={page}
        limit={limit}
        totalUsers={data.totalUsers}
        totalPages={data.totalPages}
        isCurrentMonth={isCurrentMonth}
        isReadOnly={isReadOnly}
        hasChanges={hasChanges}
        isSaving={isSaving}
        currentEditablePeriod={currentEditablePeriod}
        isFullscreen={isFullscreen}
        onSave={handleSaveAttendance}
        onPageChange={onPageChange}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        getPeriodBadge={getPeriodBadge}
        month={month}
        year={year}
        users={data.attendanceData}
      />
      <div className="bg-white border border-slate-400 shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-3 py-2 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-700 sticky left-0 bg-slate-800 z-10 min-w-24">
                  Name
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const isToday = isCurrentMonth && day === currentDate;
                    const isPast = isCurrentMonth && day < currentDate;
                    return (
                      <th
                        key={day}
                        className={`px-1 py-2 text-center text-xs font-bold uppercase tracking-wide border-r border-slate-700 min-w-10 ${
                          isToday
                            ? "bg-blue-700 text-white"
                            : isPast
                            ? "bg-slate-700 text-slate-300"
                            : "text-white"
                        }`}
                      >
                        {day}
                      </th>
                    );
                  }
                )}
                <th className="px-3 py-2 text-center text-xs font-bold text-white uppercase tracking-wide min-w-28">
                  Bill Remaining
                </th>
              </tr>
            </thead>
            <AttendanceTableBody
              data={data}
              daysInMonth={daysInMonth}
              isCurrentMonth={isCurrentMonth}
              currentDate={currentDate}
              balanceChanges={balanceChanges}
              getAttendanceStatus={getAttendanceStatus}
              handleAttendanceClick={handleAttendanceClick}
            />
          </table>
        </div>
      </div>
      {/* <AttendanceLegend
        currentEditablePeriod={currentEditablePeriod}
        isMorningTime={isMorningTime}
        isEveningTime={isEveningTime}
        isBeforeMorningTime={isBeforeMorningTime}
      /> */}
    </div>
  );
};

export default AttendanceTable;
