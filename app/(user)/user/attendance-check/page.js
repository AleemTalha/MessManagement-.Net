"use client";

import { useState, useMemo, useEffect } from "react";
import { useUserAttendance } from "@/utils/useUserAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarDaysIcon, ClockIcon, CurrencyDollarIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubmitAbsenceApplication } from "@/utils/useAbsenceApplications";

const getStatusBadge = (isMarked, isTaken) => {
  if (!isMarked) return <Badge variant="secondary">-</Badge>;
  return isTaken ? <Badge className="bg-green-100 text-green-800">P</Badge> : <Badge className="bg-red-100 text-red-800">A</Badge>;
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

const AttendanceTable = ({ attendance }) => {
  const stats = useMemo(() => {
    if (!attendance) return [];
    const taken = attendance.dailyAttendances.filter(d => d.mealsCount > 0).length;
    const absent = attendance.dailyAttendances.filter(d => (d.morningIsMarked || d.eveningIsMarked) && d.mealsCount === 0).length;
    const unmarked = attendance.dailyAttendances.filter(d => !d.morningIsMarked && !d.eveningIsMarked).length;
    return [
      { name: 'Taken', value: taken, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#ef4444' },
      { name: 'Unmarked', value: unmarked, color: '#6b7280' }
    ];
  }, [attendance]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const submitApplication = useSubmitAbsenceApplication();

  const handleVerificationRequest = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    try {
      await submitApplication.mutateAsync({ date: selectedDate, type: "Verification" });
      setIsModalOpen(false);
      setSelectedDate("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!attendance) return <p className="text-gray-500">No data available</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Total Bill</span>
              </div>
              <p className="text-4xl font-bold">{attendance.totalMonthlyBill}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Meals Taken</span>
              </div>
              <p className="text-4xl font-bold">{attendance.totalMealsTaken}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Month</span>
              </div>
              <p className="text-4xl font-bold">{attendance.month}/{attendance.year}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Total Days</span>
              </div>
              <p className="text-4xl font-bold">{attendance.dailyAttendances.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Morning</TableHead>
                <TableHead>Evening</TableHead>
                <TableHead>Meals Count</TableHead>
                <TableHead>Daily Total</TableHead>
                <TableHead className="w-20">Verification Request</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...attendance.dailyAttendances].sort((a, b) => new Date(a.date) - new Date(b.date)).map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">{new Date(day.date).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(day.morningIsMarked, day.morningMealTaken)}</TableCell>
                  <TableCell>{getStatusBadge(day.eveningIsMarked, day.eveningMealTaken)}</TableCell>
                  <TableCell>{day.mealsCount}</TableCell>
                  <TableCell>{day.dailyTotal}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1" onClick={() => handleVerificationRequest(day.date)}>
                            <CheckCircleIcon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Click to request verification for {new Date(day.date).toLocaleDateString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Attendance Verification</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitVerification} className="space-y-4">
            <div>
              <Label htmlFor="verify-date">Date to Verify</Label>
              <Input
                id="verify-date"
                type="date"
                value={selectedDate}
                readOnly
              />
            </div>
            <p className="text-sm text-gray-600">
              This will submit a verification request for the selected date. The admin will review your attendance record.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitApplication.isPending}>
                {submitApplication.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function AttendanceCheckPage() {
  const { data: rawData, isLoading, error } = useUserAttendance();
  const [currentIndex, setCurrentIndex] = useState(0);

  const data = useMemo(() => {
    if (!rawData) return null;
    let months = [];
    if (rawData.currentMonth) months.push(rawData.currentMonth);
    if (rawData.previousMonth) {
      months.push(rawData.previousMonth);
    } else if (rawData.currentMonth) {
      // Generate previous month if null
      const current = rawData.currentMonth;
      const prevMonth = current.month === 1 ? 12 : current.month - 1;
      const prevYear = current.month === 1 ? current.year - 1 : current.year;
      const days = getDaysInMonth(prevMonth, prevYear);
      const dailyAttendances = [];
      for (let day = 1; day <= days; day++) {
        const date = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        dailyAttendances.push({
          day,
          date,
          morningIsMarked: false,
          eveningIsMarked: false,
          morningMealTaken: false,
          morningMealName: "",
          morningMealPrice: 0,
          morningChargedAmount: 0,
          eveningMealTaken: false,
          eveningMealName: "",
          eveningMealPrice: 0,
          eveningChargedAmount: 0,
          notes: "",
          dailyTotal: 0,
          mealsCount: 0
        });
      }
      months.push({
        id: null,
        month: prevMonth,
        year: prevYear,
        totalMonthlyBill: 0,
        totalMealsTaken: 0,
        dailyAttendances
      });
    }
    return { months };
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading attendance: {error.message}</p>
      </div>
    );
  }

  const months = data?.months || [];
  const currentMonth = months[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < months.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Check</h1>
          <p className="text-gray-600 mt-2">View your attendance records and statistics</p>
        </div>
        <div className="flex items-center gap-2">
         
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === months.length - 1}
            >
            <ChevronLeftIcon className="w-4 h-4" />
            Prev
          </Button>
           <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {currentMonth ? (
        <AttendanceTable attendance={currentMonth} />
      ) : (
        <p className="text-gray-500">No attendance data available</p>
      )}
    </div>
  );
}
