"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import AttendanceCell from './AttendanceCell'

export default function AttendanceTableBody({
  data,
  daysInMonth,
  isCurrentMonth,
  currentDate,
  balanceChanges,
  getAttendanceStatus,
  handleAttendanceClick
}) {
  return (
    <tbody>
      {data.attendanceData.map((user, userIndex) => {
        const balanceChange = balanceChanges[userIndex] || 0
        const adjustedBillRemaining = (user.balance?.billRemaining || 0) + balanceChange
        
        return (
          <tr
            key={userIndex}
            className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <td className="px-3 py-2 border-r-2 border-slate-200 sticky left-0 bg-white z-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-semibold text-slate-900 text-sm truncate max-w-40 cursor-pointer">
                      {user.userName}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-semibold">{user.userName}</p>
                      <p className="text-xs text-slate-500">{user.userEmail}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </td>
            
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const morningStatus = user.morningAttendance[day - 1]
              const eveningStatus = user.eveningAttendance[day - 1]
              const isToday = isCurrentMonth && day === currentDate
              const isPast = isCurrentMonth && day < currentDate
              const morning = getAttendanceStatus(day, morningStatus, userIndex, 'morning')
              const evening = getAttendanceStatus(day, eveningStatus, userIndex, 'evening')

              return (
                <td
                  key={day}
                  className={`px-1 py-2 border-r border-slate-200 ${
                    isToday ? 'bg-blue-50' : isPast ? 'bg-slate-50' : ''
                  }`}
                >
                  <AttendanceCell
                    morning={morning}
                    evening={evening}
                    onMorningClick={() => handleAttendanceClick(userIndex, day, 'morning')}
                    onEveningClick={() => handleAttendanceClick(userIndex, day, 'evening')}
                  />
                </td>
              )
            })}
            
            <td className="px-3 py-2 text-center bg-slate-50">
              <div className="flex flex-col items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-center cursor-pointer">
                        <p className="text-lg font-bold text-slate-900">
                          PKR {adjustedBillRemaining.toFixed(2)}
                        </p>
                        {/* <p className="text-xs text-slate-500 mt-0.5">
                          Bill Remaining
                        </p> */}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.summary?.totalMeals || 0} meals taken</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}
