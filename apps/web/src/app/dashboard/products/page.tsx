"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useProducts } from "@/react-query/products/product-queries";
import { useCategories } from "@/react-query/categories/category-queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit, Search, AlertCircle, Package } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { ProductForm } from "@/components/products/ProductForm";

export default function ProductsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: categories } = useCategories(userId);
  const { data: productsData, isLoading } = useProducts({
    userId, search: debouncedSearch, status: statusFilter, categoryId: categoryFilter, page, limit: 10
  });

  const deleteMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/products/${id}?userId=${userId}`),
    invalidateKeys: [["products"], ["dashboard-stats"]],
    successMessage: "Product deleted",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory products and stock levels.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm 
              categories={categories || []} 
              initialData={editingProduct} 
              onClose={() => setIsDialogOpen(false)} 
              userId={userId!} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9 h-10 border-slate-200 dark:border-[#333] rounded-full" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] rounded-full h-10 border-slate-200 dark:border-[#333]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px] rounded-full h-10 border-slate-200 dark:border-[#333]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : productsData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="h-10 w-10 mb-2 opacity-20" />
                    <p>No products found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              productsData?.data?.map((product: any) => {
                const isLowStock = product.stockQuantity > 0 && product.stockQuantity < product.minStockThreshold;
                return (
                  <TableRow key={product.id} className="group transition-colors">
                    <TableCell>
                      <span className="font-medium line-clamp-1">{product.name}</span>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-normal">{product.category.name}</Badge></TableCell>
                    <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${product.stockQuantity === 0 ? "text-destructive" : isLowStock ? "text-warning" : ""}`}>
                          {product.stockQuantity}
                        </span>
                        {isLowStock && <span title="Low stock"><AlertCircle className="h-4 w-4 text-warning" /></span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "ACTIVE" ? "success" : "destructive"}>
                        {product.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(product); setIsDialogOpen(true); }}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (confirm(`Delete "${product.name}"?`)) deleteMutation.mutate(product.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        
        {/* Pagination placeholder */}
        {productsData?.meta && productsData.meta.totalPage > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, productsData.meta.total)} of {productsData.meta.total} products
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(productsData.meta.totalPage, p + 1))} disabled={page === productsData.meta.totalPage}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
