"use client"
import { Save, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    <div className="mb-4 bg-white border border-slate-200">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs text-slate-600 font-medium hidden lg:block">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalUsers)} of {totalUsers} users
          </p>

          {isCurrentMonth && (
            <div className="hidden lg:block">
              {getPeriodBadge()}
            </div>
          )}

          {isReadOnly && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 hidden lg:inline-block">
              READ ONLY MODE
            </span>
          )}

          {hasChanges && !isReadOnly && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hidden lg:inline-block">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">

          {!isReadOnly && currentEditablePeriod !== "none" && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className="
                h-8 px-2 md:px-3
                bg-slate-900 text-white
                hover:bg-slate-800
                border border-slate-900
                font-medium
                disabled:bg-slate-300 disabled:text-slate-500
              "
            >
              <Save className="w-4 h-4" />
              <span className="hidden md:inline ml-1">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="
              h-8 px-2 md:px-3
              bg-white text-slate-700
              border border-slate-300
              hover:bg-slate-100 hover:text-slate-900
              font-medium
              disabled:opacity-40
            "
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline ml-1">Prev</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="
              h-8 px-2 md:px-3
              bg-white text-slate-700
              border border-slate-300
              hover:bg-slate-100 hover:text-slate-900
              font-medium
              disabled:opacity-40
            "
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden md:inline ml-1">Next</span>
          </Button>

          <Button
            size="sm"
            onClick={onToggleFullscreen}
            className="
              h-8 px-2 md:px-3
              bg-white text-slate-600
              border border-slate-300
              hover:bg-slate-100 hover:text-slate-900
              font-medium
            "
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span className="hidden md:inline ml-1">
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </Button>

        </div>
      </div>
    </div>
  )
}
