import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import requestLogger from "./app/middlewares/requestLogger";

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
const corsOptions = {
  origin: [
    process.env.BETTER_AUTH_SECRET || "http://localhost:3000",
    "https://order-stock-web.vercel.app", // Example production URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Application routes
app.use("/api/v1", router);

app.get("/", (_req, res) => {
  res.json({ message: "Order-Stock Management API is running", status: "ok" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(globalErrorHandler);
app.use(notFound);

export default app;

