import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import requestLogger from "./app/middlewares/requestLogger";
import { ENV } from "@repo/database/config";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(cors({ origin: [ENV.better_auth_url!], credentials: true }));

// Application routes
app.use("/api/v1", router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
