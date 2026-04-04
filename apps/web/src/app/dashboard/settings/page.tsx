"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { motion } from "motion/react";
import { useRouter, redirect } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const userRole = (session?.user as any)?.role || "USER";
  if (userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        
        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-slate-200 dark:border-[#333] shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="w-full">Upload New</Button>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={session?.user?.name} disabled />
                <p className="text-[10px] text-muted-foreground">Contact support to change your name.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={session?.user?.email} disabled />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl border border-slate-200 dark:border-[#333] shadow-sm p-6 lg:p-8">
          <h3 className="text-lg font-semibold mb-6 text-destructive">Danger Zone</h3>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-destructive/20 bg-destructive/5 rounded-2xl">
            <div className="space-y-1">
              <h4 className="font-medium text-foreground">Sign Out</h4>
              <p className="text-sm text-muted-foreground">Securely log out of this device.</p>
            </div>
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              Sign Out Now
            </Button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
