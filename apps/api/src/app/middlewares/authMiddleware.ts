import { NextFunction, Request, Response } from "express";
import { auth } from "@repo/database";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

const authMiddleware = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // getSession requires the request headers to extract cookies
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    const { user } = session;

    // Check roles if any are required
    if (requiredRoles.length > 0 && !requiredRoles.includes((user as any).role)) {
      throw new AppError(httpStatus.FORBIDDEN, "You do not have the required permissions!");
    }

    // Attach user to request for further use
    (req as any).user = user;

    next();
  });
};

export default authMiddleware;
