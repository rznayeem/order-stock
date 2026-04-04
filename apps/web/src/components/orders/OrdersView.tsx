"use client";

import { useState } from "react";
import { useOrders } from "@/react-query/orders/order-queries";
import { useProducts } from "@/react-query/products/product-queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useAppMutation } from "@/hooks/useAppMutation";
import axiosInstance from "@/lib/axios";
import { Plus, Search, Eye, ShoppingCart, MoreHorizontal, User, DollarSign, CalendarIcon, X } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/table";
import { Skeleton } from "@repo/ui/components/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@repo/ui/components/dialog";
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
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import { Calendar } from "@repo/ui/components/calendar";
import { OrderForm } from "@/components/orders/OrderForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { format } from "date-fns";

interface OrdersViewProps {
  userId: string;
}

export function OrdersView({ userId }: OrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [statusChange, setStatusChange] = useState<{ id: string; status: string } | null>(null);

  const { data: ordersData, isLoading } = useOrders({
    userId,
    search: debouncedSearch,
    status: statusFilter,
    dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
    page,
    limit: 10,
  });

  const { data: allProducts } = useProducts({ 
    userId, 
    limit: 1000,
  });

  const updateStatusMutation = useAppMutation({
    mutationFn: (data: { id: string; status: string }) => axiosInstance.patch(`/orders/${data.id}/status?userId=${userId}`, { status: data.status }),
    invalidateKeys: [["orders"], ["dashboard-stats"], ["products"]],
    successMessage: "Order status updated",
  });

  const handleStatusUpdate = () => {
    if (statusChange) {
      updateStatusMutation.mutate(statusChange);
      setStatusChange(null);
    }
  };

  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PENDING": return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none text-[10px] h-5">Pending</Badge>;
      case "CONFIRMED": return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none text-[10px] h-5">Confirmed</Badge>;
      case "SHIPPED": return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-none text-[10px] h-5">Shipped</Badge>;
      case "DELIVERED": return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] h-5">Delivered</Badge>;
      case "CANCELLED": return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-none text-[10px] h-5">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders and workflow statuses.</p>
        </div>
        
        <Button onClick={() => setIsSheetOpen(true)} className="rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Order
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-muted/30 p-3 rounded-xl border border-muted/60">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter orders or customers..." 
            className="pl-9 h-9 border-muted/60 bg-background rounded-lg text-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg bg-background border-muted/60 text-xs">
              <SelectValue placeholder="All Statuses" />
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

          {/* Date Picker Section omitted for brevity or implemented as needed */}
          <div className="flex gap-2">
              {/* Date From Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 rounded-lg bg-background border-muted/60 text-xs font-normal w-[130px] justify-start">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Date To Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 rounded-lg bg-background border-muted/60 text-xs font-normal w-[130px] justify-start">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilters} className="h-9 text-xs text-muted-foreground hover:text-foreground px-2">
                  <X className="h-3.5 w-3.5 mr-1" /> Clear
                </Button>
              )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-muted/60 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && !ordersData ? (
              [1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : ordersData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <div className="p-4 rounded-full bg-muted/50 mb-2">
                      <ShoppingCart className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium text-sm">No orders found</p>
                    <p className="text-xs">Customer orders will appear here once created.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ordersData?.data?.map((order: any) => (
                <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="py-4 font-mono text-xs font-semibold text-primary">#{order.orderNumber}</TableCell>
                  <TableCell className="font-semibold text-sm">{order.customerName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-bold text-sm">${order.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={order.status}
                      disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
                      onValueChange={(val) => setStatusChange({ id: order.id, status: val })}
                    >
                      <SelectTrigger className="h-7 w-[110px] border-none shadow-none bg-transparent hover:bg-muted/50 transition-colors p-0 focus:ring-0 text-left">
                        {getStatusBadge(order.status)}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                        <SelectItem value="CONFIRMED" className="text-xs">Confirmed</SelectItem>
                        <SelectItem value="SHIPPED" className="text-xs">Shipped</SelectItem>
                        <SelectItem value="DELIVERED" className="text-xs">Delivered</SelectItem>
                        <SelectItem value="CANCELLED" className="text-xs text-destructive">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">Order Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => setViewingOrder(order)}>
                          <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {ordersData?.meta && ordersData.meta.totalPage > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-muted/60 bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium">
              Showing <span className="text-foreground">{(page - 1) * 10 + 1}</span> to <span className="text-foreground">{Math.min(page * 10, ordersData.meta.total)}</span> of <span className="text-foreground">{ordersData.meta.total}</span> orders
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium px-3" onClick={() => setPage(p => Math.min(ordersData.meta.totalPage, p + 1))} disabled={page === ordersData.meta.totalPage}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Sheet for Creation */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader className="mb-8">
            <SheetTitle>Create New Order</SheetTitle>
            <SheetDescription>
              Select products and enter customer details to register a new order in the system.
            </SheetDescription>
          </SheetHeader>
          <OrderForm 
            products={allProducts?.data || []}
            onClose={() => setIsSheetOpen(false)} 
            userId={userId!} 
          />
        </SheetContent>
      </Sheet>

      {/* Dialog for details */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="text-xl">Order #{viewingOrder?.orderNumber}</DialogTitle>
                <DialogDescription className="mt-1">
                  Placed on {viewingOrder && format(new Date(viewingOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </div>
              {viewingOrder && getStatusBadge(viewingOrder.status)}
            </div>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
             <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-3 flex items-center gap-3 bg-muted/20">
                   <div className="bg-background rounded-lg p-2 border shadow-sm">
                      <User className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Customer</p>
                      <p className="text-sm font-semibold">{viewingOrder?.customerName}</p>
                   </div>
                </div>
                <div className="rounded-xl border p-3 flex items-center gap-3 bg-muted/20">
                   <div className="bg-background rounded-lg p-2 border shadow-sm">
                      <DollarSign className="h-4 w-4 text-primary" />
                   </div>
                   <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Amount</p>
                      <p className="text-sm font-semibold">${viewingOrder?.totalPrice.toFixed(2)}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Order Items</h4>
                <div className="rounded-xl border divide-y overflow-hidden">
                   {viewingOrder?.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/5 hover:bg-muted/10 transition-colors">
                        <div className="flex flex-col">
                           <span className="text-sm font-medium">{item.product.name}</span>
                           <span className="text-xs text-muted-foreground">{item.quantity} units @ ${item.unitPrice.toFixed(2)}</span>
                        </div>
                        <span className="font-semibold text-sm">${item.subtotal.toFixed(2)}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex justify-between items-center py-2 border-t mt-2">
                <span className="text-muted-foreground text-sm">Grand Total</span>
                <span className="text-2xl font-black text-primary">${viewingOrder?.totalPrice.toFixed(2)}</span>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!statusChange}
        onClose={() => setStatusChange(null)}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        description={`Are you sure you want to change the status to "${statusChange?.status}"? ${statusChange?.status === 'CANCELLED' ? 'Warning: This will restore stock for all items in this order.' : ''}`}
        confirmText="Update Status"
      />
    </div>
  );
}
