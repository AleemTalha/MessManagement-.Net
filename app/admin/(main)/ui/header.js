"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminBreadcrumb } from "@/components/admin-breadCrubm";
import {
  QuestionMarkCircleIcon,
  BellIcon,
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

export function AdminHeader() {
  const [showClock, setShowClock] = React.useState(false);

  React.useEffect(() => {
    // Load clock visibility from cookie
    const saved = localStorage.getItem('admin-clock-visible');
    if (saved !== null) {
      setShowClock(JSON.parse(saved));
    }
  }, []);

  const toggleClock = () => {
    const newState = !showClock;
    setShowClock(newState);
    localStorage.setItem('admin-clock-visible', JSON.stringify(newState));
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('clockVisibilityChanged', { detail: newState }));
  };

  return (
    <header className="sticky max-w-full overflow-hidden top-0 z-10 bg-slate-200/60 backdrop-blur-md border-b border-slate-200/60">
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger className="text-slate-600 hover:text-slate-950 cursor-pointer transition-colors duration-200" />
          <div className="hidden lg:block min-w-0 flex-1">
            <AdminBreadcrumb className="text-sm truncate" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleClock}
            className={`p-1 cursor-pointer rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all duration-200 ${
              showClock ? 'bg-slate-100 text-slate-900' : ''
            }`}
            title={showClock ? "Hide Clock" : "Show Clock"}
          >
            <ClockIcon className="w-5 h-5" />
          </button>

          <button
            className="p-1 cursor-pointer rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all duration-200"
            title="Help"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>

          <button
            className="relative cursor-pointer p-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all duration-200"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-px h-5 bg-slate-300/60 mx-1"></div>
          <button
            className="relative cursor-pointer flex items-center hover:bg-slate-100/70 transition-all duration-200 rounded-full"
            title="User menu"
          >
            <UserCircleIcon className="w-9 h-9 rounded-full text-slate-700" />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}