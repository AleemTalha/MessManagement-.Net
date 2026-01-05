"use client"
import { Clock, Save, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function AttendanceHeader({
  page,
  limit,
  totalUsers,
  totalPages,
  isCurrentMonth,
  isReadOnly,
  hasChanges,
  isSaving,
  currentEditablePeriod,
  isFullscreen,
  onSave,
  onPageChange,
  onToggleFullscreen,
  getPeriodBadge
}) {
  return (
    <div className="mb-4 bg-white border border-slate-800 shadow-sm">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 flex-wrap">
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-slate-700 font-medium hidden lg:block">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalUsers)} of {totalUsers} users
                </p>
              </TooltipTrigger>
              <TooltipContent>
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalUsers)} of {totalUsers} users
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isCurrentMonth && (
            <div className="hidden lg:block">
              {getPeriodBadge()}
            </div>
          )}

          {isReadOnly && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 hidden lg:inline-block">
                    READ ONLY MODE
                  </span>
                </TooltipTrigger>
                <TooltipContent>Read only mode enabled</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {hasChanges && !isReadOnly && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 hidden lg:inline-block">
                    Unsaved Changes
                  </span>
                </TooltipTrigger>
                <TooltipContent>There are unsaved changes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

        </div>

        <div className="flex items-center gap-2">

          {!isReadOnly && currentEditablePeriod !== 'none' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSave}
                    disabled={!hasChanges || isSaving}
                    className="h-8 px-2 md:px-3 border border-green-700 bg-green-600 text-white hover:bg-green-700 font-medium disabled:opacity-40 disabled:bg-slate-400"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden md:inline ml-1">
                      {isSaving ? 'Saving...' : 'Save'}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save attendance changes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 px-2 md:px-3 border border-slate-800 hover:bg-slate-800 hover:text-white font-medium disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">Prev</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Previous page</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="h-8 px-2 md:px-3 border border-slate-800 hover:bg-slate-800 hover:text-white font-medium disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">Next</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Next page</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="h-8 px-2 md:px-3 border border-slate-800 hover:bg-slate-800 hover:text-white font-medium"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline ml-1">
                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>
    </div>
  )
}
