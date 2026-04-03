"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useOrders } from "@/react-query/orders/order-queries";
import { useProducts } from "@/react-query/products/product-queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select";
import { Badge } from "@repo/ui/components/badge";
import { OrderForm } from "@/components/orders/OrderForm";
import { format } from "date-fns";

export default function OrdersPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const { data: ordersData, isLoading } = useOrders({
    userId, search: debouncedSearch, status: statusFilter, page, limit: 10
  });

  // Need all active products for the ordder form
  const { data: allProducts } = useProducts({ userId, limit: 1000 });

  const updateStatusMutation = useAppMutation({
    mutationFn: (data: { id: string; status: string }) => axiosInstance.patch(`/orders/${data.id}/status?userId=${userId}`, { status: data.status }),
    invalidateKeys: [["orders"], ["dashboard-stats"], ["products"]],
    successMessage: "Order status updated",
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "warning";
      case "CONFIRMED": return "default";
      case "SHIPPED": return "secondary";
      case "DELIVERED": return "success";
      case "CANCELLED": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and workflow statuses.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-2 h-4 w-4" /> Create Order
          </Button>
          <DialogContent className="max-w-2xl bg-background border-border">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
            </DialogHeader>
            <OrderForm 
              products={allProducts?.data || []}
              onClose={() => setIsDialogOpen(false)} 
              userId={userId!} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex mx-auto flex-col md:flex-row gap-4 items-center">
         <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders, customers..." 
            className="pl-9 h-10 border-slate-200 dark:border-[#333] rounded-full" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] rounded-full h-10 border-slate-200 dark:border-[#333]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total ($)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : ordersData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-10 w-10 mb-2 opacity-20" />
                    <p>No orders found matching your filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ordersData?.data?.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primary">#{order.orderNumber}</TableCell>
                  <TableCell className="font-semibold">{order.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-bold">${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={order.status}
                      disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
                      onValueChange={(val) => {
                        if (confirm(`Change status to ${val}? ${val === 'CANCELLED' ? 'Stock will be restored.' : ''}`)) {
                          updateStatusMutation.mutate({ id: order.id, status: val });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-xs font-semibold">
                        <Badge variant={getStatusColor(order.status) as any} className="w-full text-center py-0.5 rounded-sm">
                          {order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 shadow-none" onClick={() => setViewingOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Order #{viewingOrder?.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Customer</p>
                              <p className="font-semibold text-lg">{viewingOrder?.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="text-sm font-medium">{viewingOrder && format(new Date(viewingOrder.createdAt), "MMMM d, yyyy")}</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm mb-2 border-b pb-1">Items</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {viewingOrder?.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium">{item.product.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                                  </div>
                                  <p className="text-sm font-semibold">${item.subtotal.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t pt-3 mt-4">
                            <p className="font-bold">Total</p>
                            <p className="text-xl font-bold text-primary">${viewingOrder?.totalPrice.toFixed(2)}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {ordersData?.meta && ordersData.meta.totalPage > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, ordersData.meta.total)} of {ordersData.meta.total} orders
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(ordersData.meta.totalPage, p + 1))} disabled={page === ordersData.meta.totalPage}>Next</Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
