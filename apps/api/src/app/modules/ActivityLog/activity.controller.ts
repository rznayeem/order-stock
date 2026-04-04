import { Request, Response } from "express";
import httpStatus from "http-status";
import { ActivityService } from "./activity.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { userId, limit } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await ActivityService.getActivityLogs(userId as string, limit ? Number(limit) : undefined);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Activity logs fetched", data: result });
});

export const ActivityController = { getAll };
