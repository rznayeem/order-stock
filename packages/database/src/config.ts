// Vercel injects env at runtime. Locally, resolve `.env.local` from repo root or app cwd.
if (process.env.VERCEL !== "1") {
  try {
    const { existsSync } = require("fs") as typeof import("fs");
    const path = require("path") as typeof import("path");
    const candidates = [
      path.join(process.cwd(), ".env.local"),
      path.join(process.cwd(), "..", ".env.local"),
      path.join(process.cwd(), "..", "..", ".env.local"),
    ];
    const envPath = candidates.find((p) => existsSync(p));
    if (envPath) {
      require("dotenv").config({ path: envPath });
    }
  } catch {
    /* optional local env */
  }
}

/** Comma-separated list of allowed browser origins (e.g. https://app.vercel.app,http://localhost:3000). */
function parseOriginList(value: string | undefined): string[] | undefined {
  if (!value?.trim()) return undefined;
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const ENV = {
  databaseUrl: process.env.DATABASE_URL,
  directURL: process.env.DIRECT_URL,
  node_env: process.env.NODE_ENV,
  server_port: process.env.SERVER_PORT,
  better_auth_url: process.env.BETTER_AUTH_URL,
  better_auth_secret: process.env.BETTER_AUTH_SECRET,
  /** Optional; defaults to BETTER_AUTH_URL. Use comma-separated origins for previews or multiple frontends. */
  better_auth_trusted_origins: parseOriginList(process.env.BETTER_AUTH_TRUSTED_ORIGINS),
  /** Optional CORS origins; defaults to BETTER_AUTH_URL + localhost dev. Comma-separated. */
  cors_origins: parseOriginList(process.env.CORS_ORIGINS),
};
