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

// Global Rate Limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200, // Increased slightly for dashboard apps
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
});

// Security Middlewares
app.use(helmet());
app.use(globalLimiter);

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// CORS configuration - allow Next.js app
app.use(
  cors({
    origin: [ENV.better_auth_url!, "http://localhost:3000"], // Include local dev if needed
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Application routes
app.use("/api/v1", router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;

