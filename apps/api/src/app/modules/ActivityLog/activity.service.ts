import { prisma } from "@repo/database";

const getActivityLogs = async (userId: string, limit = 20) => {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const ActivityService = { getActivityLogs };
