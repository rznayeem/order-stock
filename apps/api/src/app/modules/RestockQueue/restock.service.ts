import { prisma } from "@repo/database";

const getRestockQueue = async (userId: string) => {
  return prisma.restockQueue.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: [{ priority: "asc" }, { product: { stockQuantity: "asc" } }],
  });
};

const removeFromQueue = async (id: string, userId: string) => {
  return prisma.restockQueue.delete({ where: { id, userId } });
};

export const RestockService = { getRestockQueue, removeFromQueue };
