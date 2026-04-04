"use client";

import { useState } from "react";
import { useCategories } from "@/react-query/categories/category-queries";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { Plus, Trash2, Edit, FolderOpen, MoreHorizontal } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@repo/ui/components/dropdown-menu";
import { Label } from "@repo/ui/components/label";
import { Badge } from "@repo/ui/components/badge";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface CategoriesViewProps {
  userId: string;
}

export function CategoriesView({ userId }: CategoriesViewProps) {
  const { data: categories, isLoading } = useCategories(userId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

  const createMutation = useAppMutation({
    mutationFn: (data: { name: string; userId: string }) => axiosInstance.post("/categories", data),
    invalidateKeys: [["categories"]],
    successMessage: "Category created",
  });

  const updateMutation = useAppMutation({
    mutationFn: (data: { id: string; name: string }) => axiosInstance.patch(`/categories/${data.id}?userId=${userId}`, { name: data.name }),
    invalidateKeys: [["categories"]],
    successMessage: "Category updated",
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/categories/${id}?userId=${userId}`),
    invalidateKeys: [["categories"]],
    successMessage: "Category deleted",
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

  const handleDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">Manage your product categories.</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="rounded-xl border border-muted/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[400px]">Category Name</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !categories ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="p-4 rounded-full bg-muted/50 mb-2">
                      <FolderOpen className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium text-sm">No categories found</p>
                    <p className="text-xs">Create a category to begin grouping products.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories?.map((category: any) => (
                <TableRow key={category.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{category.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">ID: {category.id.slice(-8)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium border-primary/20 bg-primary/5 text-primary text-[10px]">
                      {category._count?.products || 0} products
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">
                    {format(new Date(category.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => handleEdit(category)}>
                          <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-xs cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setCategoryToDelete(category)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) { setEditingId(null); setName(""); }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Update Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Change the category name below." : "Create a new category to organize your inventory products."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g., Electronics, Fashion" 
                autoFocus 
                required 
                className="rounded-lg border-muted/60"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending || !name.trim()} className="rounded-lg">
                {editingId ? "Update Category" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? All products associated with this category will be preserved, but will no longer have a primary category.`}
        confirmText="Delete Category"
        variant="destructive"
      />
    </div>
  );
}
