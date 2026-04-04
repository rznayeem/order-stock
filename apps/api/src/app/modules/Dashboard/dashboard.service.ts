import { prisma } from "@repo/database";

const getDashboardStats = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalOrdersToday, pendingOrders, completedOrders, cancelledOrders,
    totalProducts, totalCategories,
    revenueTodayResult, totalRevenueResult, restockQueueCount,
    recentOrders, productSummary,
  ] = await Promise.all([
    prisma.order.count({ where: { userId, createdAt: { gte: today, lt: tomorrow } } }),
    prisma.order.count({ where: { userId, status: "PENDING" } }),
    prisma.order.count({ where: { userId, status: "DELIVERED" } }),
    prisma.order.count({ where: { userId, status: "CANCELLED" } }),
    prisma.product.count({ where: { userId } }),
    prisma.category.count({ where: { userId } }),
    prisma.order.aggregate({ where: { userId, createdAt: { gte: today, lt: tomorrow }, status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    prisma.order.aggregate({ where: { userId, status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    prisma.restockQueue.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    prisma.product.findMany({ where: { userId }, orderBy: { stockQuantity: "asc" }, take: 10, include: { category: true } }),
  ]);

  // Calculate low stock count manually (Prisma raw comparison isn't ideal)
  const allProducts = await prisma.product.findMany({ where: { userId }, select: { stockQuantity: true, minStockThreshold: true } });
  const actualLowStock = allProducts.filter((p) => p.stockQuantity <= p.minStockThreshold).length;

  // Get order chart data (last 7 days)
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const [dayOrders, dayRevenue] = await Promise.all([
      prisma.order.count({ where: { userId, createdAt: { gte: date, lt: nextDate } } }),
      prisma.order.aggregate({ where: { userId, createdAt: { gte: date, lt: nextDate }, status: { not: "CANCELLED" } }, _sum: { totalPrice: true } }),
    ]);

    chartData.push({
      date: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      orders: dayOrders,
      revenue: dayRevenue._sum.totalPrice || 0,
    });
  }

  return {
    totalOrdersToday,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    lowStockCount: actualLowStock,
    totalProducts,
    totalCategories,
    revenueToday: revenueTodayResult._sum.totalPrice || 0,
    totalRevenue: totalRevenueResult._sum.totalPrice || 0,
    restockQueueCount,
    recentOrders,
    productSummary,
    chartData,
  };
};

export const DashboardService = { getDashboardStats };
