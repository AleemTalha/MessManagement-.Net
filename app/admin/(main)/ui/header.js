"use client";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminBreadcrumb } from "@/components/admin-breadCrubm";
import { useTheme } from "next-themes";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

export function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky max-w-full overflow-hidden top-0 z-10 bg-slate-200/60 dark:bg-slate-950 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger className="text-slate-600 dark:text-slate-400 hover:text-slate-950 cursor-pointer dark:hover:text-slate-100 transition-colors duration-200" />
          <div className="hidden lg:block min-w-0 flex-1">
            <AdminBreadcrumb className="text-sm truncate" />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button className="flex items-center justify-center md:w-65 md:justify-start py-2 px-3 md:rounded-xl rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 text-sm gap-2 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300/50 dark:hover:border-slate-600/50 cursor-pointer">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-300 dark:text-slate-200 shrink-0" />
              <span className="hidden md:inline text-left flex-1 truncate font-medium">
                Search...
              </span>
              <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md border border-slate-300/50 dark:border-slate-600/50 font-mono">
                ⌘K
              </span>
            </button>
          </div>

          <button
            className="p-1 cursor-pointer rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200"
            title="Help"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
          </button>

          <button
            className="p-1 cursor-pointer rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200"
            title="Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>

          <button
            className="relative cursor-pointer p-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200"
            title="Notifications"
          >
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-1 cursor-pointer rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200"
            title="Toggle theme"
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>

          <div className="w-px h-5 bg-slate-300/60 dark:bg-slate-600/60 mx-1"></div>

          <button
            className="relative cursor-pointer flex items-center hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200 rounded-full"
            title="User menu"
          >
            <UserCircleIcon className="w-9 h-9 rounded-full text-slate-700 dark:text-slate-300" />
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
