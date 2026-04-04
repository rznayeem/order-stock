"use client";

import { useState } from "react";
import { useProducts } from "@/react-query/products/product-queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit, Search, AlertCircle, Package, MoreHorizontal } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from "@repo/ui/components/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@repo/ui/components/dropdown-menu";
import { ProductForm } from "@/components/products/ProductForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface ProductsViewProps {
  userId: string;
}

export function ProductsView({ userId }: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const { data: productsData, isLoading } = useProducts({
    userId, 
    search: debouncedSearch, 
    status: statusFilter, 
    categoryId: categoryFilter, 
    page, 
    limit: 10,
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/products/${id}?userId=${userId}`),
    invalidateKeys: [["products"], ["dashboard-stats"]],
    successMessage: "Product deleted",
  });

  const handleDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory products and stock levels.</p>
        </div>
        
        <Button onClick={() => { setEditingProduct(null); setIsSheetOpen(true); }} className="rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-muted/30 p-3 rounded-xl border border-muted/60">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter products..." 
            className="pl-9 h-9 border-muted/60 bg-background rounded-lg text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px] rounded-lg bg-background border-muted/60 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[150px] rounded-lg bg-background border-muted/60 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {/* Categories will be populated via useCategories in the form or we can add a useCategories hook here if needed for filter */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-muted/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !productsData ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : productsData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="p-4 rounded-full bg-muted/50 mb-2">
                      <Package className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium text-sm">No products found</p>
                    <p className="text-xs">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productsData?.data?.map((product: any) => {
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity < product.minStockThreshold;
                return (
                  <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm line-clamp-1">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">ID: {product.id.slice(-8)}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-normal text-[10px]">{product.category.name}</Badge></TableCell>
                    <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${product.stockQuantity === 0 ? "text-destructive" : isLowStock ? "text-orange-500" : ""}`}>
                          {product.stockQuantity}
                        </span>
                        {isLowStock && <AlertCircle className="h-3 w-3 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] h-5 border-none ${
                          product.status === "ACTIVE" 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {product.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                      </Badge>
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
                          <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => { setEditingProduct(product); setIsSheetOpen(true); }}>
                            <Edit className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-xs cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => setProductToDelete(product)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {productsData?.meta && productsData.meta.totalPage > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-muted/60 bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium">
              Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, productsData.meta.total)}</span> of <span className="text-foreground">{productsData.meta.total}</span> products
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.min(productsData.meta.totalPage, p + 1))} disabled={page === productsData.meta.totalPage}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) setEditingProduct(null);
      }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="mb-8">
            <SheetTitle>{editingProduct ? "Update Product" : "Create New Product"}</SheetTitle>
            <SheetDescription>
              {editingProduct 
                ? "Modify the existing product details. Click save to store changes." 
                : "Fill in the details to add a new item to your inventory registry."}
            </SheetDescription>
          </SheetHeader>
          <ProductForm 
            initialData={editingProduct} 
            onClose={() => setIsSheetOpen(false)} 
            userId={userId!} 
          />
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Remove Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone and will permanently remove the item from your inventory records.`}
        confirmText="Remove Product"
        variant="destructive"
      />
    </div>
  );
}
