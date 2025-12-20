import { AppSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "./ui/header";
import AdminSidebarProvider from "./ui/sidebarProvider.js";
import { cookies } from "next/headers";
import ScrollToTopClient from "./ui/ScrollToTopClient.js";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <div className="">
      <AdminSidebarProvider
        defaultOpen={defaultOpen}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "20rem",
        }}
      >
        <AppSidebar defaultOpen={defaultOpen} />
        <main className="w-full min-w-0">
          <AdminHeader />
          <ScrollToTopClient>
            <div className=" px-2 md:px-4 lg:px-6">{children}</div>
          </ScrollToTopClient>
        </main>
      </AdminSidebarProvider>
    </div>
  );
}
