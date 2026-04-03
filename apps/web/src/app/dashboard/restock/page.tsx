"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRestockQueue } from "@/react-query/restock/restock-queries";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion } from "motion/react";
import { Trash2, AlertTriangle, PackagePlus, AlertCircle, ArrowUpRight, Inbox } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@repo/ui/components/dialog";
import { Label } from "@repo/ui/components/label";
import { Badge } from "@repo/ui/components/badge";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { redirect } from "next/navigation";

export default function RestockQueuePage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userRole = (session?.user as any)?.role || "USER";
  
  if (userRole !== "ADMIN" && userRole !== "MANAGER") {
    redirect("/dashboard");
  }
  
  const { data: queue, isLoading } = useRestockQueue(userId);
  const [restockItem, setRestockItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [itemToRemove, setItemToRemove] = useState<any>(null);

  const restockMutation = useAppMutation({
    mutationFn: (data: { id: string; quantity: number }) => axiosInstance.patch(`/products/${data.id}/restock?userId=${userId}`, { quantity: data.quantity }),
    invalidateKeys: [["restock-queue"], ["products"], ["dashboard-stats"]],
    successMessage: "Stock updated",
  });

  const removeMutation = useAppMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/restock-queue/${id}?userId=${userId}`),
    invalidateKeys: [["restock-queue"]],
    successMessage: "Alert removed",
  });

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || quantity <= 0) return;
    
    await restockMutation.mutateAsync({ id: restockItem.productId, quantity });
    setRestockItem(null);
    setQuantity(0);
  };

  const handleRemove = () => {
    if (itemToRemove) {
      removeMutation.mutate(itemToRemove.id);
      setItemToRemove(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH": return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-none text-[10px] h-5 font-bold">High Priority</Badge>;
      case "MEDIUM": return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[10px] h-5 font-bold">Medium</Badge>;
      case "LOW": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none text-[10px] h-5 font-bold">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
             <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Restock Queue</h1>
            <p className="text-muted-foreground mt-1">Products currently below their minimum threshold.</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-muted/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[150px]">Priority</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : queue?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                      <Inbox className="h-8 w-8" />
                    </div>
                    <p className="font-medium text-sm text-foreground">Stock levels are healthy</p>
                    <p className="text-xs">No products currently require restocking attention.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              queue?.map((item: any) => (
                <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4">{getPriorityBadge(item.priority)}</TableCell>
                  <TableCell className="font-semibold text-sm">{item.product.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-rose-600">{item.product.stockQuantity} units</span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-rose-500" 
                           style={{ width: `${Math.min(100, (item.product.stockQuantity / item.product.minStockThreshold) * 100)}%` }} 
                         />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{item.product.minStockThreshold}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => setItemToRemove(item)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      <Button variant="default" size="sm" className="h-8 text-xs font-medium rounded-lg px-3" onClick={() => setRestockItem(item)}>
                        <PackagePlus className="h-3.5 w-3.5 mr-1.5" /> Restock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!restockItem} onOpenChange={(open) => !open && setRestockItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Inventory</DialogTitle>
            <DialogDescription>Enter the quantity received to update stock levels.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRestock} className="space-y-6 pt-4">
            <div className="rounded-xl border p-4 bg-muted/20 flex flex-col items-center text-center gap-2">
               <div className="p-3 rounded-full bg-background border shadow-sm mb-1">
                  <PackagePlus className="h-6 w-6 text-primary" />
               </div>
               <div>
                  <p className="text-sm font-bold">{restockItem?.product.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Currently at <span className="font-bold text-rose-600">{restockItem?.product.stockQuantity}</span> units</p>
               </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Added</Label>
              <div className="relative">
                <ArrowUpRight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="quantity" 
                  type="number" 
                  autoFocus
                  min="1"
                  required
                  className="pl-10 text-base font-semibold"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                New inventory balance will be <span className="font-bold text-foreground">{(restockItem?.product.stockQuantity || 0) + quantity}</span> units.
              </p>
            </div>
            
            <DialogFooter className="sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRestockItem(null)} className="rounded-lg">Cancel</Button>
              <Button type="submit" disabled={restockMutation.isPending || quantity <= 0} className="rounded-lg">
                Update Inventory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!itemToRemove}
        onClose={() => setItemToRemove(null)}
        onConfirm={handleRemove}
        title="Remove Restock Alert"
        description={`Are you sure you want to remove "${itemToRemove?.product.name}" from the restock queue? This will not update the stock level, but it will hide this urgent alert until the system re-triggers it.`}
        confirmText="Remove Alert"
        variant="destructive"
      />
    </div>
  );
}
