import { createAuthClient } from "better-auth/react";
import { ENV } from "@repo/database/config";

export const authClient = createAuthClient({
  baseURL: ENV.better_auth_url!,
});

export const { signIn, signUp, useSession, signOut } = authClient;
