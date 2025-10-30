import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from '../ui/sidebar';
import { Toaster } from '../ui/toaster';

export function Outlet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen">
      <Toaster />
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col w-full">{children}</main>
      </SidebarProvider>
    </div>
  );
}
