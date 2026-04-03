"use client";

import { useSession } from "@/lib/auth-client";
import { useDashboardStats } from "@/react-query/dashboard/dashboard-queries";
import { StatsCard } from "./StatsCard";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Activity, DollarSign, Users, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { motion } from "motion/react";
import { format } from "date-fns";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name.split(' ')[0]}. Here's your inventory overview.
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
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value={`$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: "+12.5%", label: "from yesterday", positive: true }}
              delay={0.1}
            />
            <StatsCard
              title="Orders"
              value={stats.totalOrdersToday.toString()}
              icon={<ShoppingCart className="h-4 w-4" />}
              trend={{ value: "+5.2%", label: "from yesterday", positive: true }}
              delay={0.2}
            />
            <StatsCard
              title="Low Stock"
              value={stats.lowStockCount.toString()}
              icon={<AlertTriangle className="h-4 w-4" />}
              description={stats.lowStockCount > 0 ? "Items require restock" : "All items in stock"}
              delay={0.3}
            />
            <StatsCard
              title="Active Products"
              value={stats.totalProducts.toString()}
              icon={<Package className="h-4 w-4" />}
              description={`Across ${stats.totalCategories} categories`}
              delay={0.4}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-7">
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

            <Card className="lg:col-span-3 shadow-sm border-muted/60">
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
                          <p className="text-xs text-muted-foreground">{order.customerEmail || 'Guest Customer'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tracking-tight">+${order.totalPrice.toFixed(2)}</p>
                          <Badge variant="outline" className="text-[10px] h-4 mt-1 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
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
                        <button className="flex items-center justify-start gap-2 rounded-lg bg-background p-2 text-xs font-medium border shadow-sm hover:bg-accent transition-colors">
                          <Package className="h-3.5 w-3.5" /> Add Product
                        </button>
                        <button className="flex items-center justify-start gap-2 rounded-lg bg-background p-2 text-xs font-medium border shadow-sm hover:bg-accent transition-colors">
                          <ShoppingCart className="h-3.5 w-3.5" /> New Order
                        </button>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
