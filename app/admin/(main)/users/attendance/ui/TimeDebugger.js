"use client"
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TimeDebugger({ debugTime, setDebugTime }) {
  return (
    <div className="mb-3 bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-3 shadow-md">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-purple-900">Time Debugger (Testing Mode)</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="time"
            value={debugTime ? `${String(debugTime.getHours()).padStart(2, '0')}:${String(debugTime.getMinutes()).padStart(2, '0')}` : ''}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':')
              const newTime = new Date()
              newTime.setHours(parseInt(hours))
              newTime.setMinutes(parseInt(minutes))
              setDebugTime(newTime)
            }}
            className="px-3 py-1 text-sm border-2 border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button
            size="sm"
            onClick={() => setDebugTime(null)}
            variant="outline"
            className="h-8 border-2 border-purple-300 hover:bg-purple-100 text-purple-700 font-semibold"
          >
            Reset to Real Time
          </Button>
          {debugTime && (
            <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded border-2 border-purple-300">
              Test Time: {debugTime.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
