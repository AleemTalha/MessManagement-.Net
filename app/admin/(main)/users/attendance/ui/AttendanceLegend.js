"use client"

export default function AttendanceLegend({ 
  currentEditablePeriod,
  isMorningTime,
  isEveningTime,
  isBeforeMorningTime 
}) {
  return (
    <div className="mt-4 bg-white border border-slate-300 p-4">
      <h3 className="text-sm font-bold text-slate-900 mb-2">Legend</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 bg-green-600 border border-slate-700 flex items-center justify-center text-white text-xs font-bold">P</div>
          <span className="text-xs text-slate-700">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 bg-orange-500 border border-slate-700 flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="text-xs text-slate-700">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 bg-slate-100 border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">—</div>
          <span className="text-xs text-slate-700">Not Yet / Future</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-5 bg-blue-700 border border-slate-700 flex items-center justify-center text-white text-xs font-bold">★</div>
          <span className="text-xs text-slate-700">Today (Editable)</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Note:</strong> You can only edit attendance for <strong>today&apos;s {currentEditablePeriod === 'morning' ? 'morning' : currentEditablePeriod === 'evening' ? 'evening' : 'current'} period</strong>.
          {isMorningTime && ' Morning period is active (6 AM - 3 PM). Evening attendance will be available after 3 PM.'}
          {isEveningTime && ' Evening period is active (3 PM onwards). Morning period has passed.'}
          {isBeforeMorningTime && ' Attendance marking starts at 6 AM.'}
        </p>
      </div>
    </div>
  )
}
