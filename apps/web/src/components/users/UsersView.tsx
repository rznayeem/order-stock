"use client";

import { useState } from "react";
import { useUsers } from "@/react-query/users/user-queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { Search, Users, UserCog, Download } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { format } from "date-fns";
import Link from "next/link";

interface UsersViewProps {
  userId: string;
}

export function UsersView({ userId }: UsersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [roleChange, setRoleChange] = useState<{ id: string; name: string; role: string } | null>(null);

  const { data: usersData, isLoading } = useUsers({
    search: debouncedSearch,
    role: roleFilter,
    page,
    limit: 10,
  });

  const updateRoleMutation = useAppMutation({
    mutationFn: (data: { id: string; role: string }) => axiosInstance.patch(`/users/${data.id}/role?userId=${userId}`, { role: data.role }),
    invalidateKeys: [["users"]],
    successMessage: "User role updated successfully",
  });

  const handleRoleUpdate = () => {
    if (roleChange) {
      updateRoleMutation.mutate({ id: roleChange.id, role: roleChange.role });
      setRoleChange(null);
    }
  };

  const handleExportCSV = () => {
    if (!usersData?.data || usersData.data.length === 0) return;
    const headers = ["ID", "Name", "Email", "Role", "Joined Date"];
    const rows = usersData.data.map((user: any) => [user.id, `"${user.name}"`, user.email, user.role, format(new Date(user.createdAt), "yyyy-MM-dd")]);
    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "ADMIN": return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-none">Admin</Badge>;
      case "MANAGER": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none">Manager</Badge>;
      default: return <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-none">User</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system access and assign roles to team members.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV} disabled={isLoading || !usersData?.data?.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button asChild>
            <Link href="/dashboard/users/create">
              Create User
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-muted/30 p-3 rounded-xl border border-muted/60">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9 h-9 border-muted/60 bg-background rounded-lg text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg bg-background border-muted/60 text-xs">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="MANAGER">Managers</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-muted/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !usersData ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : usersData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="p-4 rounded-full bg-muted/50 mb-2">
                      <Users className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium text-sm">No users found</p>
                    <p className="text-xs">Try adjusting your search or role filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              usersData?.data?.map((user: any) => (
                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-sm">{user.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.id === userId ? (
                      getRoleBadge(user.role)
                    ) : (
                      <Select 
                        defaultValue={user.role}
                        onValueChange={(val) => setRoleChange({ id: user.id, name: user.name, role: val })}
                      >
                        <SelectTrigger className="h-8 w-[120px] bg-background border-muted/60 focus:ring-0 text-left">
                          <SelectValue>{getRoleBadge(user.role)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User (Read-only)</SelectItem>
                          <SelectItem value="MANAGER">Manager (Ops)</SelectItem>
                          <SelectItem value="ADMIN">Admin (Full)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id === userId ? (
                      <Badge variant="secondary" className="font-normal text-[10px]">Current User</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8" disabled>
                        <UserCog className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {usersData?.meta && usersData.meta.totalPage > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-muted/60 bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium">
              Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, usersData.meta.total)}</span> of <span className="text-foreground">{usersData.meta.total}</span> users
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.min(usersData.meta.totalPage, p + 1))} disabled={page === usersData.meta.totalPage}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!roleChange}
        onClose={() => setRoleChange(null)}
        onConfirm={handleRoleUpdate}
        title="Update User Role"
        description={`Are you sure you want to change ${roleChange?.name}'s role to ${roleChange?.role}? This will immediately update their access permissions.`}
        confirmText="Confirm Change"
      />
    </div>
  );
}
