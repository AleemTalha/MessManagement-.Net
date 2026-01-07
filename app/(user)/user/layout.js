import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import { UserHeader } from "./ui/header";

export default function UserLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <UserSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <UserHeader />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
