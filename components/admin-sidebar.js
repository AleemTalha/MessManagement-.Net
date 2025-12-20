"use client";

import {
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  useSidebar,
} from "./ui/sidebar";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOutIcon, ChefHat } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const brandName = "Mess Management System";

const dummyLinks = [
  { title: "Dashboard", icon: HomeIcon, href: "/admin/dashboard" },
  { title: "Users", icon: UsersIcon, href: "#" },
  { title: "Meals & Schedules", icon: ClipboardDocumentListIcon, href: "/admin/meals" },
  { title: "Schedule", icon: CalendarDaysIcon, href: "#" },
  { title: "Reports", icon: ChartBarIcon, href: "#" },
  { title: "Settings", icon: CogIcon, href: "#" },
];

export function AppSidebar({ children }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();

  const handleLogout = () => {
    toast("Logged out successfully");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="manrope bg-slate-200/60 dark:bg-slate-950 backdrop-blur-md border-b border-slate-300 dark:border-slate-700/60 flex flex-col"
    >
      <SidebarHeader className="p-4 bg-slate-200/60 dark:bg-slate-950 backdrop-blur-md border-b border-slate-300 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-slate-800 dark:text-slate-200" />
          {!isCollapsed && <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{brandName}</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-1 pl-2 bg-slate-200/60 dark:bg-slate-950 backdrop-blur-md">
        <SidebarMenu>
          {dummyLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md px-2 py-2">
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-slate-200/60 dark:bg-slate-950 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-700/60 p-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
