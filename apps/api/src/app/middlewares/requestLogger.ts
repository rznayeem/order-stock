import { Request, Response, NextFunction } from "express";
import chalk from "chalk";

const methodColor = (method: string) => {
  switch (method) {
    case "GET": return chalk.greenBright(method);
    case "POST": return chalk.cyanBright(method);
    case "PUT": return chalk.blueBright(method);
    case "PATCH": return chalk.magentaBright(method);
    case "DELETE": return chalk.redBright(method);
    default: return chalk.white(method);
  }
};

const statusColor = (status: number) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  return chalk.green(status);
};

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      [chalk.gray(new Date().toISOString()), methodColor(req.method), chalk.white(req.originalUrl), statusColor(res.statusCode), chalk.gray(`${duration}ms`)].join("  ")
    );
  });
  next();
};

export default requestLogger;
