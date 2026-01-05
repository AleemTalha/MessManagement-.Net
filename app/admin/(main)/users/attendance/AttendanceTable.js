"use client"
import { useState } from 'react'
import { useAttendance } from '@/utils/useAttendance'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AttendanceTable = ({ month, year, page, limit, onPageChange }) => {
  const { data, isLoading, isError, error } = useAttendance(month, year, page, limit)
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Loading attendance...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-red-200">
        <div className="text-center">
          <p className="text-red-700 font-semibold text-lg">Error Loading Data</p>
          <p className="text-sm text-red-600 mt-2">{error?.message}</p>
        </div>
      </div>
    )
  }

  if (!data?.attendanceData?.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-white border border-slate-200">
        <p className="text-slate-500 text-lg">No attendance data available</p>
      </div>
    )
  }

  const currentDate = new Date().getDate()
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const daysInMonth = data.daysInMonth
  const isCurrentMonth = month === currentMonth && year === currentYear

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const getAttendanceStatus = (status, isToday) => {
    if (status === 'p') {
      return { 
        bg: isToday ? 'bg-green-700' : 'bg-green-600', 
        text: 'P',
        textColor: 'text-white'
      }
    }
    if (status === 'a') {
      return { 
        bg: isToday ? 'bg-orange-600' : 'bg-orange-500', 
        text: 'A',
        textColor: 'text-white'
      }
    }
    return { 
      bg: 'bg-slate-50', 
      text: '—',
      textColor: 'text-slate-300'
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 p-8 overflow-auto' : 'w-full'}`}>
      {/* Header Section */}
      <div className="bg-white border-b-4 border-slate-800 shadow-sm mb-6">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-slate-800 p-3">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Attendance Register
                </h1>
                <p className="text-slate-600 font-medium mt-1">
                  {new Date(year, month - 1).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })} • {data.totalUsers} Users
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="border-2 border-slate-300 hover:border-slate-800 hover:bg-slate-100"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border-2 border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wide border-r-2 border-slate-700 sticky left-0 bg-slate-800 z-10 min-w-[180px]">
                  Name
                </th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isToday = isCurrentMonth && day === currentDate
                  return (
                    <th 
                      key={day} 
                      className={`px-3 py-4 text-center text-sm font-bold uppercase tracking-wide border-r border-slate-700 min-w-[65px] ${
                        isToday 
                          ? 'bg-blue-700 text-white' 
                          : 'text-white'
                      }`}
                    >
                      {day}
                    </th>
                  )
                })}
                <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wide min-w-[140px]">
                  Total Bill
                </th>
              </tr>
            </thead>
            <tbody>
              {data.attendanceData.map((user, userIndex) => (
                <tr 
                  key={userIndex} 
                  className="border-b-2 border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3 border-r-2 border-slate-200 sticky left-0 bg-white z-10">
                    <p className="font-bold text-slate-900 text-base">{user.userName}</p>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const morningStatus = user.morningAttendance[day - 1]
                    const eveningStatus = user.eveningAttendance[day - 1]
                    const isToday = isCurrentMonth && day === currentDate
                    const morning = getAttendanceStatus(morningStatus, isToday)
                    const evening = getAttendanceStatus(eveningStatus, isToday)

                    return (
                      <td 
                        key={day} 
                        className={`px-3 py-3 border-r border-slate-200 ${
                          isToday ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-1.5 items-center">
                          <div className={`${morning.bg} ${morning.textColor} w-9 h-7 flex items-center justify-center text-xs font-bold border border-slate-800`}>
                            {morning.text}
                          </div>
                          <div className={`${evening.bg} ${evening.textColor} w-9 h-7 flex items-center justify-center text-xs font-bold border border-slate-800`}>
                            {evening.text}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-6 py-3 text-center bg-slate-50">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold text-slate-900 text-lg">
                        ₹{user.summary.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        {user.summary.totalMeals} meals
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-6 bg-white border-2 border-slate-800 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-700 font-medium">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, data.totalUsers)} of {data.totalUsers} users
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-9 px-4 border-2 border-slate-800 hover:bg-slate-800 hover:text-white font-bold disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm font-bold text-slate-900 px-3 py-1 bg-slate-100 border-2 border-slate-800">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.totalPages}
              className="h-9 px-4 border-2 border-slate-800 hover:bg-slate-800 hover:text-white font-bold disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white border-2 border-slate-800 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center gap-8 flex-wrap">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="bg-green-600 text-white w-9 h-7 flex items-center justify-center text-xs font-bold border border-slate-800">
                P
              </div>
              <span className="text-sm text-slate-700 font-medium">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-500 text-white w-9 h-7 flex items-center justify-center text-xs font-bold border border-slate-800">
                A
              </div>
              <span className="text-sm text-slate-700 font-medium">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-50 text-slate-300 w-9 h-7 flex items-center justify-center text-xs font-bold border border-slate-800">
                —
              </div>
              <span className="text-sm text-slate-700 font-medium">No Record</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-700 text-white px-3 h-7 flex items-center justify-center text-xs font-bold border border-slate-800">
                TODAY
              </div>
              <span className="text-sm text-slate-700 font-medium">Current Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTable