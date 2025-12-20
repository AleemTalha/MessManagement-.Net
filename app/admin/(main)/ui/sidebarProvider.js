"use client";

import React from "react";
import { SidebarProvider as CoreSidebarProvider } from "@/components/ui/sidebar";

export default function AdminSidebarProvider({ children, ...props }) {
  return (
    <CoreSidebarProvider {...props}>
      {children}
    </CoreSidebarProvider>
  );
}
