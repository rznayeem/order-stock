import { Request, Response } from "express";
import httpStatus from "http-status";
import { RestockService } from "./restock.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await RestockService.getRestockQueue(userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Restock queue fetched", data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await RestockService.removeFromQueue(id as string, userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Removed from restock queue", data: result });
});

export const RestockController = { getAll, remove };
