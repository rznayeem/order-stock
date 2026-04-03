"use client";

import { useSidebar } from "./SidebarContext";
import { Button } from "@repo/ui/components/button";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@repo/ui/components/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function Header() {
  const { setIsMobileOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-4 bg-transparent px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 flex items-center justify-between">
        <div className="hidden lg:flex max-w-md w-full items-center relative">
          <Search className="absolute left-3 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search orders, products..." className="pl-9 h-10 w-full bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-[#333] shadow-sm rounded-full" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full relative mr-2">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 flex-shrink-0 ring-2 ring-primary/20 transition-all hover:ring-primary/40 data-[state=open]:ring-primary/40">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session?.user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
