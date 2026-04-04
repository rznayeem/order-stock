import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import requestLogger from "./app/middlewares/requestLogger";
import { ENV } from "@repo/database/config";

const app: Application = express();

function normalizeOrigin(o: string | undefined): string | undefined {
  if (!o?.trim()) return undefined;
  return o.replace(/\/$/, "");
}

const corsAllowList = new Set<string>(
  [
    ...(ENV.cors_origins ?? []),
    normalizeOrigin(ENV.better_auth_url),
    "http://localhost:3000",
  ].filter((x): x is string => Boolean(x))
);

// CORS first so error/rate-limit responses still include CORS headers for browsers.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const n = normalizeOrigin(origin);
      if (n && corsAllowList.has(n)) return callback(null, origin);
      callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  })
);

// Global Rate Limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200, // Increased slightly for dashboard apps
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(globalLimiter);

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Application routes
app.use("/api/v1", router);

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "order-stock-api", docs: "/health" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;

