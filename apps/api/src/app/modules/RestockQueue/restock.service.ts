import { prisma } from "@repo/database";

const priorityOrder: Record<string, number> = { HIGH: 1, MEDIUM: 2, LOW: 3 };

const getRestockQueue = async (userId: string) => {
  const items = await prisma.restockQueue.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
  });

  // Sort by priority (HIGH > MEDIUM > LOW), then by lowest stock first
  return items.sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    return a.product.stockQuantity - b.product.stockQuantity;
  });
};

const removeFromQueue = async (id: string, userId: string) => {
  return prisma.restockQueue.delete({ where: { id, userId } });
};

export const RestockService = { getRestockQueue, removeFromQueue };
