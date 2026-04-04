import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ENV } from "./config";

const adapter = new PrismaPg({
  connectionString: ENV.databaseUrl!,
});

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (ENV.node_env !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "../generated/client";
