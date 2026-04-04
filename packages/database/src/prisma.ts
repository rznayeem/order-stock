import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ENV } from "./config";

const adapter = new PrismaPg({
  connectionString: ENV.databaseUrl!,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // In production (serverless), we still store it globally if possible, 
  // but PrismaClient singleton is the recommended way for Vercel.
  globalForPrisma.prisma = prisma;
}

export * from "../generated/client";
