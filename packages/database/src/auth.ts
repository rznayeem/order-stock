import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ENV } from "./config";
import { prisma } from "./prisma";

const trustedOrigins =
  ENV.better_auth_trusted_origins?.length ?
    ENV.better_auth_trusted_origins
  : [ENV.better_auth_url!];

export const auth = betterAuth({
  baseURL: ENV.better_auth_url!,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: ENV.better_auth_secret!,
  advanced: { cookiePrefix: "order_stock" },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER" },
      banned: { type: "boolean", defaultValue: false },
    },
  },
});
