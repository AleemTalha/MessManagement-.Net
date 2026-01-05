"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusIcon, User, Save } from "lucide-react";
import Link from "next/link";

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const showAddButton = pathname === "/admin/users";
  const showSaveButton = pathname === "/admin/users/attendance";

  const handleSaveAttendance = () => {
    window.dispatchEvent(new CustomEvent("saveAttendance"));
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white py-2 md:py-4 border-slate-200">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="p-3 bg-blue-600 rounded-sm flex items-center justify-center shadow-sm shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 truncate">
                User Management
              </h1>
              <p className="text-xs md:text-base text-slate-600 mt-1 truncate">
                Manage your mess users, roles, and permissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showSaveButton && (
              <Button
                onClick={handleSaveAttendance}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-sm text-sm md:text-base shadow-sm transition-colors"
                size="lg"
              >
                <Save className="h-4 w-4 md:h-5 md:w-5" />
                Save <span className="hidden md:inline-block">Attendance</span>
              </Button>
            )}
            {showAddButton && (
              <Button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openAddUserModal"))
                }
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-sm text-sm md:text-base shadow-sm transition-colors"
                size="lg"
              >
                <PlusIcon className="h-4 w-4 md:h-5 md:w-5" />
                Add <span className="hidden md:inline-block">New User</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <nav className="sticky top-15 z-20 bg-white border-b border-slate-200">
        <div className="flex gap-3">
          <Link
            href="/admin/users"
            className={`relative text-slate-700 font-medium px-3 py-2 transition-colors duration-200 text-sm md:text-base ${
              pathname === "/admin/users"
                ? "text-blue-500 border-b-2 border-blue-400"
                : "hover:text-blue-500"
            }`}
          >
            Users
          </Link>
          <Link
            href="/admin/users/attendance"
            className={`relative text-slate-700 font-medium px-3 py-2 transition-colors duration-200 text-sm md:text-base ${
              pathname === "/admin/users/attendance"
                ? "text-blue-500 border-b-2 border-blue-400"
                : "hover:text-blue-500"
            }`}
          >
            Attendance
          </Link>
        </div>
      </nav>

      <div className="pt-6">{children}</div>
    </div>
  );
}
