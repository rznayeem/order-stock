import { prisma, Prisma } from "@repo/database";

const getUsers = async (query: { search?: string; role?: string; page?: number; limit?: number }) => {
  const { search, role, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "all") {
    where.role = role as any;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: users.map(({ ...rest }) => rest), // Remove sensitive fields if any later
  };
};

const updateUserRole = async (userId: string, currentUserId: string, newRole: string) => {
  // Verify current user is admin
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can change roles");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as any },
  });

  return updatedUser;
};

export const UserService = { getUsers, updateUserRole };
