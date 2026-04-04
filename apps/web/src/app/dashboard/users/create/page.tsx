"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@/react-query/users/user-queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { CheckCircle2, XCircle, ArrowLeft, Shield, UserPlus } from "lucide-react";

const rolePermissions = {
  ADMIN: [
    { module: "Dashboard & Analytics", granted: true },
    { module: "Order Management", granted: true },
    { module: "Product & Inventory", granted: true },
    { module: "Categories Setup", granted: true },
    { module: "Restock Queue", granted: true },
    { module: "Activity Logs", granted: true },
    { module: "User Roles & Permissions", granted: true },
    { module: "System Settings", granted: true },
  ],
  MANAGER: [
    { module: "Dashboard & Analytics", granted: true },
    { module: "Order Management", granted: true },
    { module: "Product & Inventory", granted: true },
    { module: "Categories Setup", granted: true },
    { module: "Restock Queue", granted: true },
    { module: "Activity Logs", granted: true },
    { module: "User Roles & Permissions", granted: false },
    { module: "System Settings", granted: false },
  ],
  USER: [
    { module: "Dashboard & Analytics", granted: false },
    { module: "Order Management", granted: true },
    { module: "Product & Inventory", granted: false },
    { module: "Categories Setup", granted: false },
    { module: "Restock Queue", granted: false },
    { module: "Activity Logs", granted: false },
    { module: "User Roles & Permissions", granted: false },
    { module: "System Settings", granted: false },
  ]
};

export default function CreateUserPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const { mutate: createUser, isPending } = useCreateUser(session?.user?.id as string);

  // Security Redirect (redundant with layout, but safe)
  if (userRole !== "ADMIN") {
    if (typeof window !== "undefined") {
      router.replace("/dashboard");
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) return;

    createUser(formData, {
      onSuccess: () => {
        router.push("/dashboard/users");
      },
      onError: (error) => {
        console.error("Failed to create user", error);
      }
    });
  };

  const currentPermissions = rolePermissions[formData.role as keyof typeof rolePermissions];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
          <p className="text-muted-foreground mt-1">
            Provision a new system user and define their platform permissions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Form */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Enter the basic credentials for the new account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Min. 8 characters" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength={8}
                />
                <p className="text-[10px] text-muted-foreground">The user can change this later in settings.</p>
              </div>

              <div className="space-y-2 pt-2">
                <Label>Platform Role</Label>
                <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Base User</SelectItem>
                    <SelectItem value="MANAGER">Store Manager</SelectItem>
                    <SelectItem value="ADMIN">System Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                {isPending ? "Provisioning..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Permissions Diagram */}
        <Card className="bg-muted/10 border-muted/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Permission Matrix
            </CardTitle>
            <CardDescription className="text-xs">
              Visualizing access rights for the selected <strong className="text-foreground">{formData.role}</strong> role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPermissions.map((perm, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className={`text-sm ${perm.granted ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {perm.module}
                  </span>
                  {perm.granted ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none shrink-0 h-5 text-[10px]">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Granted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-none shrink-0 h-5 text-[10px]">
                      <XCircle className="mr-1 h-3 w-3" /> Denied
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            {formData.role === "ADMIN" && (
              <div className="mt-6 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600">
                <strong>Warning:</strong> Admin users have unrestricted, destructive access to all system tenants and billing properties.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
