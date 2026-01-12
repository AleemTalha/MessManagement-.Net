"use client";

import {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "./ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { LuLayoutDashboard } from "react-icons/lu";
import Link from "next/link";
import { handleLogout } from "@/utils/logout";
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Mess Management";

import {
  Squares2X2Icon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

const navLinks = [
  { title: "Dashboard", url: "/admin/dashboard", icon: Squares2X2Icon },
  {
    title: "Users",
    url: "/admin/users",
    icon: UsersIcon,
    children: [
      { title: "All Users", url: "/admin/users" },
      { title: "Attendance", url: "/admin/users/attendance" },
    ],
  },
  {
    title: "Meals & Schedules",
    url: "/admin/meals",
    icon: ClipboardDocumentListIcon,
    children: [
      { title: "Meals List", url: "/admin/meals" },
      { title: "Mess Schedule", url: "/admin/meals/shedule" },
    ],
  },
  { title: "Bills", url: "/admin/bills", icon: DocumentTextIcon },
  { title: "Transactions", url: "/admin/transactions", icon: BanknotesIcon },
  { title: "Absence Applications", url: "/admin/absence-applications", icon: ClipboardDocumentCheckIcon },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: ChartBarIcon,
    children: [
      { title: "Transaction History", url: "/admin/reports/transactions" },
      { title: "Bill Reports", url: "/admin/reports/bills" },
      { title: "Attendance Reports", url: "/admin/reports/attendance" },
    ],
  },
  { title: "Inventory", url: "/admin/inventory", icon: ArchiveBoxIcon },
  { title: "Expenses", url: "/admin/expenses", icon: CurrencyDollarIcon },
  { title: "Payments", url: "/admin/payments", icon: BanknotesIcon },
];

export function AppSidebar({ children }) {
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
            className={`flex items-center justify-center bg-emerald-600 rounded-md ${
              isCollapsed ? "h-8 w-8" : "h-10 w-10"
            }`}
          >
            <ShieldCheckIcon
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
                Admin Panel
              </span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-1 pl-2 bg-slate-100/80 backdrop-blur-sm">
        <SidebarGroupContent className="border border-slate-200 border-l-0 h-full rounded-r-md">
          <SidebarMenu>
            {navLinks.map((item) =>
              item.children ? (
                <Collapsible
                  key={item.title}
                  defaultOpen={false}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="flex items-center gap-2 hover:bg-slate-200/60 rounded-md px-2 py-2 transition-colors">
                        <item.icon className="h-5 w-5 text-slate-600" />
                        <span className="flex-1 text-left text-slate-700">{item.title}</span>
                        <ChevronRightIcon className="h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                        {item.children.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuButton asChild>
                              <Link
                                href={sub.url}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-200/40 hover:text-slate-800 rounded-md px-2 py-1.5 transition-colors"
                              >
                                {sub.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
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
              )
            )}

          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>

      <SidebarFooter className="bg-slate-100/80 backdrop-blur-sm border-t border-slate-200/60 p-3">
        <button
          onClick={() => handleLogout(true)}
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
