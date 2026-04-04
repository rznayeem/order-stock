import { Server } from "http";
import chalk from "chalk";
import app from "./app";
import { prisma } from "@repo/database";
import { ENV } from "@repo/database/config";

let server: Server | undefined;

/** Vercel runs Express as a single serverless function; do not bind a port or exit the process on boot. */
const isVercel = process.env.VERCEL === "1";

async function startLocalServer() {
  try {
    console.log(chalk.blueBright("🔌 Connecting to Prisma..."));
    await prisma.$connect();
    console.log(chalk.greenBright("✅ Prisma connected successfully"));

    const port = Number(ENV.server_port ?? process.env.PORT ?? 4000);

    server = app.listen(port, () => {
      console.log(
        chalk.bold.green("🚀 API is running"),
        chalk.gray("→"),
        chalk.cyan(`http://localhost:${port}`)
      );
    });
  } catch (error) {
    console.error(chalk.redBright("❌ Failed to start server"), error);
    process.exit(1);
  }
}

if (!isVercel) {
  void startLocalServer();
}

async function shutdown(signal: string) {
  console.log(chalk.yellowBright(`⚠️ ${signal} received`), chalk.gray("— shutting down gracefully..."));
  try {
    await prisma.$disconnect();
    console.log(chalk.magentaBright("🛑 Prisma disconnected"));
    if (server) {
      server.close(() => {
        console.log(chalk.gray("🧹 HTTP server closed"));
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error(chalk.red("❌ Error during shutdown"), err);
    process.exit(1);
  }
}

if (!isVercel) {
  process.on("unhandledRejection", (err) => {
    console.error(chalk.redBright("😈 Unhandled Rejection detected"), err);
    void shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error(chalk.redBright("😈 Uncaught Exception detected"), err);
    process.exit(1);
  });

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

export default app;
