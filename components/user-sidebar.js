"use client";

import {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  useSidebar,
} from "./ui/sidebar";

import Link from "next/link";
import { handleLogout } from "@/utils/logout";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Mess Management";

import {
  Squares2X2Icon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

const navLinks = [
  { title: "Dashboard", url: "/user/dashboard", icon: Squares2X2Icon },
  { title: "My Bills", url: "/user/bills", icon: BanknotesIcon },
  { title: "Transaction History", url: "/user/transaction-history", icon: ClipboardDocumentListIcon },
  { title: "Attendance Check", url: "/user/attendance-check", icon: CalendarDaysIcon },
  { title: "Absence Applications", url: "/user/absence-applications", icon: DocumentTextIcon },
  { title: "Meal Schedule", url: "/user/meal-schedule", icon: ClockIcon },
  { title: "Profile", url: "/user/profile", icon: UserCircleIcon },
  { title: "Support", url: "/user/support", icon: ChatBubbleLeftRightIcon },
];

export function UserSidebar({ children }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  return (
    <Sidebar
      collapsible="icon"
      className="manrope bg-slate-100/80 backdrop-blur-sm border-r border-slate-200/60"
    >
      <SidebarHeader className="p-1 h-15.25 bg-slate-100/80 backdrop-blur-sm border-b border-slate-200/60">
        <div
          className={`flex items-center my-auto bg-white rounded-md border border-slate-200 cursor-pointer ${
            isCollapsed ? "p-0.5 gap-0" : "gap-2 p-2 py-1"
          }`}
        >
          <div
            className={`flex items-center justify-center bg-blue-600 rounded-md ${
              isCollapsed ? "h-8 w-8" : "h-10 w-10"
            }`}
          >
            <UserCircleIcon
              className={`text-white ${
                isCollapsed ? "w-4 h-4" : "w-6 h-6"
              }`}
            />
          </div>

          {!isCollapsed && (
            <span className="inline-block max-w-[calc(100%-48px)] overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="block font-extrabold text-[16px] leading-4.5 truncate">
                {brandName}
              </span>
              <span className="block text-xs leading-3.5 truncate text-slate-600">
                User Portal
              </span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-1 pl-2 bg-slate-100/80 backdrop-blur-sm">
        <SidebarGroupContent className="border border-slate-200 border-l-0 h-full rounded-r-md">
          <SidebarMenu>
            {navLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className="flex items-center gap-2 text-slate-700 hover:bg-slate-200/60 rounded-md px-2 py-2 transition-colors"
                  >
                    <item.icon className="h-5 w-5 text-slate-600" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>

      <SidebarFooter className="bg-slate-100/80 backdrop-blur-sm border-t border-slate-200/60 p-3">
        <button
          onClick={() => handleLogout(false)}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md px-3 py-2 transition-colors border border-red-200 hover:border-red-300"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
        <div className="text-xs text-slate-500 text-center mt-2">
          Mess Management System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
