"use client"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function AttendanceCell({ 
  morning, 
  evening, 
  onMorningClick, 
  onEveningClick 
}) {
  return (
    <div className="flex flex-col gap-0.5 items-center">
      {morning.clickable ? (
        <div 
          className={`${morning.bg} ${morning.textColor} w-6 h-5 flex items-center justify-center text-xs font-bold border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 hover:ring-blue-500`}
          onClick={onMorningClick}
        >
          {morning.text}
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`${morning.bg} ${morning.textColor} w-6 h-5 flex items-center justify-center text-xs font-bold border border-slate-700`}
              >
                {morning.text}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Morning: {morning.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {evening.clickable ? (
        <div 
          className={`${evening.bg} ${evening.textColor} w-6 h-5 flex items-center justify-center text-xs font-bold border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity hover:ring-2 hover:ring-purple-500`}
          onClick={onEveningClick}
        >
          {evening.text}
        </div>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`${evening.bg} ${evening.textColor} w-6 h-5 flex items-center justify-center text-xs font-bold border border-slate-700`}
              >
                {evening.text}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Evening: {evening.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
