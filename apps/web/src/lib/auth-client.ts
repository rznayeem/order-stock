import { createAuthClient } from "better-auth/react";

/** Public site URL (NEXT_PUBLIC_* for the browser). In production set this to your deployed frontend URL (same as BETTER_AUTH_URL on the API). */
const raw =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
const baseURL = raw ? (raw.startsWith("http") ? raw : `https://${raw}`) : "";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, useSession, signOut } = authClient;
