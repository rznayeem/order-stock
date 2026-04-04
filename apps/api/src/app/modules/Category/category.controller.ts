import { Request, Response } from "express";
import httpStatus from "http-status";
import { CategoryService } from "./category.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Category created", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await CategoryService.getCategories(userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Categories fetched", data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await CategoryService.updateCategory(id as string, userId as string, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category updated", data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await CategoryService.deleteCategory(id as string, userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Category deleted", data: result });
});

export const CategoryController = { create, getAll, update, remove };
