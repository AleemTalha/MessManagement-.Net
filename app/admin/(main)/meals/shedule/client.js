"use client";

import { useState } from "react";
import { useMeals } from "@/utils/useMeals";
import { useSchedule, useCreateSchedule, useUpdateSchedule } from "@/utils/useSchedule";
import { toast } from "react-toastify";
import ScheduleTable from "./ui/ScheduleTable";
import EditDayModal from "./ui/EditDayModal";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@heroicons/react/24/outline";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleClient() {
  const { data: meals, isLoading: mealsLoading } = useMeals();
  const { data: schedule, isLoading: scheduleLoading } = useSchedule();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();

  const [editingDay, setEditingDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openEditModal = (day) => {
    setEditingDay(day);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDay(null);
  };

  const buildSchedulePayload = (day, morningMealId, eveningMealId) => {
    const payload = { messId: schedule?.messId || 1 };

    DAYS.forEach(dayName => {
      const dayKey = dayName.toLowerCase();
      const existingDay = schedule?.[dayKey];

      if (dayName === day) {
        payload[dayKey] = { morningMealId, eveningMealId };
      } else {
        payload[dayKey] = existingDay ? {
          morningMealId: existingDay.morningMeal?.id || null,
          eveningMealId: existingDay.eveningMeal?.id || null
        } : { morningMealId: null, eveningMealId: null };
      }
    });

    return payload;
  };

  const handleDayUpdate = async (day, morningMealId, eveningMealId) => {
    try {
      const payload = buildSchedulePayload(day, morningMealId, eveningMealId);

      if (schedule?.id) {
        await updateSchedule.mutateAsync({ id: schedule.id, data: payload });
        toast.success(`${day} schedule updated!`);
      } else {
        await createSchedule.mutateAsync(payload);
        toast.success("Schedule created!");
      }

      closeModal();
    } catch (error) {
      toast.error(error.message || "Failed to save schedule");
    }
  };

  const getDaySchedule = (day) => {
    const dayKey = day.toLowerCase();
    const dayData = schedule?.[dayKey];

    return {
      morningMeal: dayData?.morningMeal || null,
      eveningMeal: dayData?.eveningMeal || null,
    };
  };

  if (mealsLoading || scheduleLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-96 bg-white border border-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!meals?.length) {
    return (
      <div className="bg-white pt-20 text-center">
        <CalendarIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No meals available</h3>
        <p className="text-slate-600 mb-4">Add meals before creating a schedule.</p>
        <Button onClick={() => window.history.back()} className="bg-blue-600 hover:bg-blue-700">
          Go to Meals List
        </Button>
      </div>
    );
  }

  const isPending = createSchedule.isPending || updateSchedule.isPending;

  return (
    <div className="space-y-6">
      <ScheduleTable
        days={DAYS}
        schedule={schedule}
        getDaySchedule={getDaySchedule}
        onEditDay={openEditModal}
      />

      {editingDay && (
        <EditDayModal
          key={`${editingDay}-${isModalOpen}`}
          isOpen={isModalOpen}
          onClose={closeModal}
          day={editingDay}
          schedule={getDaySchedule(editingDay)}
          meals={meals}
          onSave={handleDayUpdate}
          isPending={isPending}
        />
      )}
    </div>
  );
}
