import { Sidebar } from "@/components/layouts/Sidebar";
import { Header } from "@/components/layouts/Header";
import { SidebarProvider } from "@/components/layouts/SidebarContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-[#F8FAFD] dark:bg-[#131313] transition-colors duration-300 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 lg:pr-4 lg:pb-4 overflow-hidden flex flex-col p-4 lg:p-0">
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1E1E1E] lg:rounded-[32px] border border-slate-200 dark:border-[#333] shadow-sm transition-colors duration-300 custom-scrollbar p-5 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
