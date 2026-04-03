"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRestockQueue } from "@/react-query/restock/restock-queries";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion } from "motion/react";
import { Trash2, AlertTriangle, PackagePlus, AlertCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Badge } from "@repo/ui/components/badge";
import { format } from "date-fns";

export default function RestockQueuePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const { data: queue, isLoading } = useRestockQueue(userId);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);

  const restockMutation = useAppMutation({
    mutationFn: (data: { id: string; quantity: number }) => axiosInstance.patch(`/products/${data.id}/restock?userId=${userId}`, { quantity: data.quantity }),
    invalidateKeys: [["restock-queue"], ["products"], ["dashboard-stats"]],
    successMessage: "Product restocked successfully",
  });

  const removeMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/restock-queue/${id}?userId=${userId}`),
    invalidateKeys: [["restock-queue"]],
    successMessage: "Removed from queue",
  });

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || quantity <= 0) return;
    
    await restockMutation.mutateAsync({ id: restockItem.productId, quantity });
    setRestockItem(null);
    setQuantity(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "warning";
      case "LOW": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-500 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" /> Restock Queue
          </h1>
          <p className="text-muted-foreground mt-1">Automatically tracked low-stock products requiring supply.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Priority</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Added To Queue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : queue?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-success">
                    <AlertCircle className="h-12 w-12 mb-3 bg-success/10 rounded-full p-2" />
                    <p className="text-lg font-semibold">Your stock is healthy!</p>
                    <p className="text-sm text-muted-foreground mt-1">No items currently need restocking.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              queue?.map((item: any) => (
                <TableRow key={item.id} className="group">
                  <TableCell>
                    <Badge variant={getPriorityColor(item.priority) as any} className="font-bold tracking-wider text-[10px]">
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-base">{item.product.name}</TableCell>
                  <TableCell>
                    <span className="text-destructive font-bold text-lg">{item.product.stockQuantity}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.product.minStockThreshold}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Remove this alert from queue?`)) removeMutation.mutate(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      <Button variant="default" size="sm" className="shadow-none" onClick={() => setRestockItem(item)}>
                        <PackagePlus className="h-4 w-4 mr-2" /> Restock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Restock Dialog */}
      <Dialog open={!!restockItem} onOpenChange={(open) => !open && setRestockItem(null)}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle>Receive Inventory</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-4 pt-4">
            <div className="flex flex-col gap-1 items-center justify-center p-6 bg-muted/50 rounded-xl mb-4 border border-border">
               <PackagePlus className="h-8 w-8 text-primary mb-2" />
               <p className="text-lg font-bold">{restockItem?.product.name}</p>
               <p className="text-sm text-muted-foreground">Current Stock: <span className="text-destructive font-bold">{restockItem?.product.stockQuantity}</span> units</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Amount Received</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">+</span>
                <Input 
                  id="quantity" 
                  type="number" 
                  autoFocus
                  min="1"
                  required
                  className="pl-8 text-lg font-bold"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                New total balance will be: <span className="font-bold text-foreground">{(restockItem?.product.stockQuantity || 0) + quantity}</span>
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRestockItem(null)}>Cancel</Button>
              <Button type="submit" disabled={restockMutation.isPending || quantity <= 0}>Confirm Restock</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
