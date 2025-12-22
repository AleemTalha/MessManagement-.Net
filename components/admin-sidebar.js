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
import { LogOutIcon, ShieldCheck } from "lucide-react";
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

const dummyLinks = [
  { title: "Dashboard", icon: HomeIcon, href: "/admin/dashboard" },
  { title: "Users", icon: UsersIcon, href: "/admin/users" },
  { title: "Meals & Schedules", icon: ClipboardDocumentListIcon, href: "/admin/meals" },
  { title: "Schedule", icon: CalendarDaysIcon, href: "#" },
  { title: "Reports", icon: ChartBarIcon, href: "#" },
  { title: "Settings", icon: CogIcon, href: "#" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    toast("Logged out successfully");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col"
    >
      <SidebarHeader className="h-16 px-4 flex items-center border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-sidebar-primary" />
          </div>
          {!isCollapsed && (
            <span className="text-base font-semibold">
              Admin Panel
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 px-2 py-3">
        <SidebarMenu>
          {dummyLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                transition-colors
                hover:bg-sidebar-accent/60
                data-[active=true]:bg-sidebar-primary/15
                data-[active=true]:text-sidebar-primary"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center gap-3 justify-start rounded-lg text-sm
          hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOutIcon className="h-4 w-4" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
