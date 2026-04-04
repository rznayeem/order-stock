import { prisma } from "@repo/database";

/**
 * Utility to serialize Prisma and Decimal types for Client Components.
 */
export function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Data Access Layer (DAL) for Server-Side Fetching.
 */
export const DAL = {
  /**
   * Fetch initial categories for a user.
   */
  async getInitialCategories(userId: string) {
    const categories = await prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return serializeData(categories);
  },

  /**
   * Fetch initial products for a user.
   */
  async getInitialProducts(userId: string, limit = 10) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: limit
      }),
      prisma.product.count({ where: { userId } })
    ]);

    return {
      data: serializeData(products),
      meta: {
        total,
        page: 1,
        limit,
        totalPage: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Fetch initial orders for a user.
   */
  async getInitialOrders(userId: string, limit = 10) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ]);

    return {
      data: serializeData(orders),
      meta: {
        total,
        page: 1,
        limit,
        totalPage: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Fetch initial restock queue for a user.
   */
  async getInitialRestockQueue(userId: string) {
    const queue = await prisma.restockQueue.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { priority: "asc" }
    });
    return serializeData(queue);
  },

  /**
   * Fetch initial users (Admin only).
   */
  async getInitialUsers(limit = 10) {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit
      }),
      prisma.user.count()
    ]);

    return {
      data: serializeData(users),
      meta: {
        total,
        page: 1,
        limit,
        totalPage: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Fetch initial activity logs for a user.
   */
  async getInitialActivityLogs(userId: string, limit = 50) {
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return serializeData(logs);
  }
};
