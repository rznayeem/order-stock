import { Server } from "http";
import chalk from "chalk";
import app from "./app";
import { prisma } from "@repo/database";
import { ENV } from "@repo/database/config";

let server: Server;

async function main() {
  try {
    console.log(chalk.blueBright("🔌 Connecting to Prisma..."));
    await prisma.$connect();
    console.log(chalk.greenBright("✅ Prisma connected successfully"));

    server = app.listen(ENV.server_port!, () => {
      console.log(
        chalk.bold.green("🚀 API is running"),
        chalk.gray("→"),
        chalk.cyan(`http://localhost:${ENV.server_port}`)
      );
    });
  } catch (error) {
    console.error(chalk.redBright("❌ Failed to start server"), error);
    process.exit(1);
  }
}

main();

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

process.on("unhandledRejection", (err) => {
  console.error(chalk.redBright("😈 Unhandled Rejection detected"), err);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error(chalk.redBright("😈 Uncaught Exception detected"), err);
  process.exit(1);
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
