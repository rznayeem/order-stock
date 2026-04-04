import { prisma, Prisma } from "@repo/database";
import { hashPassword } from "better-auth/crypto";
import { randomBytes } from "crypto";

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

const createUser = async (currentUserId: string, userData: any) => {
  // Verify current user is admin
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized: Only admins can create users");
  }

  const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const userId = `user-${randomBytes(8).toString("hex")}`;
  
  // Create User
  const newUser = await prisma.user.create({
    data: {
      id: userId,
      name: userData.name,
      email: userData.email,
      emailVerified: true,
      role: userData.role || "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Account
  const hashedPass = await hashPassword(userData.password);
  await prisma.account.create({
    data: {
      id: `account-${randomBytes(8).toString("hex")}`,
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: hashedPass,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return newUser;
};

export const UserService = { getUsers, updateUserRole, createUser };
