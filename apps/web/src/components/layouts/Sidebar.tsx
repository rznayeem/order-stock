"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import { dashboardRoutes } from "@/lib/routes";
import { useSidebar } from "./SidebarContext";
import { X, Package2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();

  const sidebarContent = (
    <>
      <div className="flex h-[72px] items-center justify-between px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package2 className="h-5 w-5" />
          </div>
          {!isCollapsed && <span className="text-xl font-bold tracking-tight">Order<span className="text-primary">Stock</span></span>}
        </Link>
        {isMobileOpen && (
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 pl-4 pr-3 lg:pl-6 custom-scrollbar">
        <nav className="flex flex-col gap-1.5">
          {dashboardRoutes.map((route) => {
            const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
            return (
              <Link key={route.href} href={route.href} onClick={() => setIsMobileOpen(false)}>
                <div
                  className={cn(
                    "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  <route.icon className={cn("h-5 w-5 flex-shrink-0 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110", isCollapsed ? "" : "mr-3")} />
                  {!isCollapsed && <span>{route.title}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 lg:p-6 pb-6">
        {!isCollapsed && (
          <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
            <h4 className="font-semibold text-sm mb-1 text-primary">Need Help?</h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Check our detailed documentation to understand all features.</p>
            <Button size="sm" className="w-full text-xs h-8 shadow-none" variant="outline">
              View Docs
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background border-r border-border shadow-2xl lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-background/50 border-r border-transparent transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-[280px]"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
