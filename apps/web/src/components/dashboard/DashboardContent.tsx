"use client";

import { useSession } from "@/lib/auth-client";
import { useDashboardStats } from "@/react-query/dashboard/dashboard-queries";
import { StatsCard } from "./StatsCard";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Activity, DollarSign, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@repo/ui/components/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
}

export function DashboardContent() {
  const { data: session } = useSession();
  const { data: stats, isLoading } = useDashboardStats(session?.user?.id);
  const router = useRouter();

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="lg:col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "USER";
  const isAdmin = userRole === "ADMIN";
  const isManager = userRole === "MANAGER";
  const isStaff = isAdmin || isManager;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name.split(' ')[0]}. Here's your {isStaff ? "inventory overview" : "orders overview"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs font-normal">
            Last updated: {format(new Date(), "HH:mm")}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isStaff && <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>}
          {isStaff && <TabsTrigger value="reports" disabled>Reports</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Primary Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isStaff ? (
              <StatsCard
                title="Total Revenue"
                value={`$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={<DollarSign className="h-4 w-4" />}
                description={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} all-time`}
                delay={0.1}
              />
            ) : null}
            <StatsCard
              title="Orders Today"
              value={stats.totalOrdersToday.toString()}
              icon={<ShoppingCart className="h-4 w-4" />}
              description={`${stats.pendingOrders + stats.completedOrders + stats.cancelledOrders} total orders`}
              delay={0.2}
            />
            <StatsCard
              title="Pending Orders"
              value={stats.pendingOrders.toString()}
              icon={<Clock className="h-4 w-4" />}
              description={stats.pendingOrders > 0 ? "Awaiting processing" : "No pending orders"}
              delay={0.3}
            />
            <StatsCard
              title="Completed Orders"
              value={stats.completedOrders.toString()}
              icon={<CheckCircle className="h-4 w-4" />}
              description={`${stats.cancelledOrders} cancelled`}
              delay={0.4}
            />
          </div>

          {/* Secondary Stats Row - Staff Only */}
          {isStaff && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Low Stock Items"
                value={stats.lowStockCount.toString()}
                icon={<AlertTriangle className="h-4 w-4" />}
                description={stats.lowStockCount > 0 ? "Items require restock" : "All items in stock"}
                delay={0.5}
              />
              <StatsCard
                title="Active Products"
                value={stats.totalProducts.toString()}
                icon={<Package className="h-4 w-4" />}
                description={`Across ${stats.totalCategories} categories`}
                delay={0.6}
              />
              <StatsCard
                title="Restock Queue"
                value={stats.restockQueueCount.toString()}
                icon={<RotateCcw className="h-4 w-4" />}
                description={stats.restockQueueCount > 0 ? "Items need restocking" : "Queue is clear"}
                delay={0.7}
              />
              <StatsCard
                title="All-Time Revenue"
                value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                icon={<TrendingUp className="h-4 w-4" />}
                description="Total non-cancelled revenue"
                delay={0.8}
              />
            </div>
          )}

          <div className={`grid gap-4 ${isStaff ? "lg:grid-cols-7" : "lg:grid-cols-1"}`}>
            {/* Revenue Chart - Staff Only */}
            {isStaff && (
              <Card className="lg:col-span-4 shadow-sm border-muted/60">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                  <CardDescription>Daily revenue performance for the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" />
                      <XAxis 
                        dataKey="label" 
                        stroke="#888888" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => value.split(',')[0]}
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#fillRevenue)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Sales */}
            <Card className={`${isStaff ? "lg:col-span-3" : "w-full lg:max-w-3xl"} shadow-sm border-muted/60`}>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
                <CardDescription>You made {stats.totalOrdersToday} sales today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {stats.recentOrders.length === 0 ? (
                    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                      No recent sales found.
                    </div>
                  ) : (
                    stats.recentOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 text-xs font-semibold">
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">Order #{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                          {isStaff && <p className="text-sm font-bold tracking-tight">+${order.totalPrice.toFixed(2)}</p>}
                          <Badge variant="outline" className={`text-[10px] h-4 mt-1 border-none ${
                            order.status === "DELIVERED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                            order.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                            order.status === "CANCELLED" ? "bg-rose-500/10 text-rose-600" :
                            "bg-blue-500/10 text-blue-600"
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-8">
                  <div className="rounded-xl bg-muted/30 p-4 border border-dashed border-muted-foreground/20">
                     <div className="flex items-center gap-3">
                        <Activity className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Quick Actions</p>
                          <p className="text-xs text-muted-foreground">Shortcuts for common tasks</p>
                        </div>
                     </div>
                     <div className="mt-3 grid grid-cols-2 gap-2">
                        {isStaff && (
                          <button 
                            onClick={() => router.push("/dashboard/products")}
                            className="flex items-center justify-start gap-2 rounded-lg bg-background p-2 text-xs font-medium border shadow-sm hover:bg-accent transition-colors"
                          >
                            <Package className="h-3.5 w-3.5" /> Add Product
                          </button>
                        )}
                        <button 
                          onClick={() => router.push("/dashboard/orders")}
                          className={`flex items-center justify-start gap-2 rounded-lg bg-background p-2 text-xs font-medium border shadow-sm hover:bg-accent transition-colors ${!isStaff ? "col-span-2 justify-center" : ""}`}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> New Order
                        </button>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Summary Section - Staff Only */}
          {isStaff && (
            <Card className="shadow-sm border-muted/60">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Product Summary</CardTitle>
                <CardDescription>Current stock levels across your inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.productSummary.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                    No products added yet. Add products to see their stock summary.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {stats.productSummary.map((product: any) => {
                      const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockThreshold;
                      const isOutOfStock = product.stockQuantity <= 0;
                      const percentage = Math.min(100, (product.stockQuantity / Math.max(product.minStockThreshold * 3, 1)) * 100);

                      return (
                        <div
                          key={product.id}
                          className={`rounded-xl border p-4 transition-all hover:shadow-md ${
                            isOutOfStock ? "border-rose-500/30 bg-rose-500/5" :
                            isLowStock ? "border-amber-500/30 bg-amber-500/5" :
                            "border-muted/60 bg-card"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                                {product.category?.name || "Uncategorized"}
                              </p>
                            </div>
                            <Badge 
                              variant="outline"
                              className={`text-[10px] h-5 border-none shrink-0 ${
                                isOutOfStock ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                                isLowStock ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "OK"}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-baseline justify-between mb-1.5">
                              <span className={`text-lg font-bold ${
                                isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : ""
                              }`}>
                                {product.stockQuantity}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {isOutOfStock ? "0 available" : `${product.stockQuantity} available`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Min threshold: {product.minStockThreshold}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
