"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useCategories } from "@/react-query/categories/category-queries";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion } from "motion/react";
import { Plus, Trash2, Edit, FolderOpen } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { format } from "date-fns";

export default function CategoriesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data: categories, isLoading } = useCategories(userId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const createMutation = useAppMutation({
    mutationFn: (data: { name: string; userId: string }) => axiosInstance.post("/categories", data),
    invalidateKeys: [["categories"]],
    successMessage: "Category created successfully",
  });

  const updateMutation = useAppMutation({
    mutationFn: (data: { id: string; name: string }) => axiosInstance.patch(`/categories/${data.id}?userId=${userId}`, { name: data.name }),
    invalidateKeys: [["categories"]],
    successMessage: "Category updated successfully",
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/categories/${id}?userId=${userId}`),
    invalidateKeys: [["categories"]],
    successMessage: "Category deleted successfully",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userId) return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, name });
    } else {
      await createMutation.mutateAsync({ name, userId });
    }
    
    setIsDialogOpen(false);
    setEditingId(null);
    setName("");
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setName(category.name);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your product categories.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingId(null); setName(""); }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-md hover:shadow-lg transition-all"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Update the name of your category." : "Create a new category to group your products."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Electronics" autoFocus required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !name.trim()}>
                  {editingId ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Products Count</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FolderOpen className="h-10 w-10 mb-2 opacity-20" />
                    <p>No categories found.</p>
                    <p className="text-sm">Create one to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category: any) => (
                <TableRow key={category.id} className="group">
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium min-w-8">
                      {category._count.products}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(category.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                            deleteMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
