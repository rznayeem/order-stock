import { Request, Response } from "express";
import httpStatus from "http-status";
import { DashboardService } from "./dashboard.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getStats = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await DashboardService.getDashboardStats(userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Dashboard stats fetched", data: result });
});

export const DashboardController = { getStats };
