"use client";

import { useSession } from "@/lib/auth-client";
import { useDashboardStats } from "@/react-query/dashboard/dashboard-queries";
import { StatsCard } from "./StatsCard";
import { RevenueChart } from "./RevenueChart";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Package, ShoppingCart, CheckCircle, AlertTriangle, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { motion } from "motion/react";
import { format } from "date-fns";

export function DashboardContent() {
  const { data: session } = useSession();
  const { data: stats, isLoading } = useDashboardStats(session?.user?.id);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name}! Here's what's happening with your inventory today.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue Today"
          value={`$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Total revenue for the day"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
          delay={0.1}
          trend="+12%"
        />
        <StatsCard
          title="Orders Today"
          value={stats.totalOrdersToday.toString()}
          subtitle={`${stats.pendingOrders} pending • ${stats.completedOrders} completed`}
          icon={<ShoppingCart className="h-6 w-6 text-blue-500" />}
          delay={0.2}
          trend="+5%"
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toString()}
          subtitle={`Across ${stats.totalCategories} categories`}
          icon={<Package className="h-6 w-6 text-purple-500" />}
          delay={0.3}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockCount.toString()}
          subtitle={stats.lowStockCount > 0 ? "Requires attention" : "All stock levels are good"}
          icon={<AlertTriangle className={`h-6 w-6 ${stats.lowStockCount > 0 ? "text-warning" : "text-success"}`} />}
          delay={0.4}
          warning={stats.lowStockCount > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-none shadow-md">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueChart data={stats.chartData} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No recent orders</p>
                ) : (
                  stats.recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, h:mm a")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${order.totalPrice.toFixed(2)}</p>
                        <Badge variant={order.status === "DELIVERED" ? "success" : order.status === "PENDING" ? "warning" : "default"} className="mt-1 text-[10px] px-1.5 py-0">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 mt-2">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-background shadow-sm hover:shadow-md transition-all text-sm font-medium text-muted-foreground hover:text-primary gap-2">
                <Package className="h-5 w-5" /> Add Product
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-background shadow-sm hover:shadow-md transition-all text-sm font-medium text-muted-foreground hover:text-primary gap-2">
                <ShoppingCart className="h-5 w-5" /> New Order
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
