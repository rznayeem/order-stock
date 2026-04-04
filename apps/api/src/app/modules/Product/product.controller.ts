import { Request, Response } from "express";
import httpStatus from "http-status";
import { ProductService } from "./product.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.createProduct(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Product created", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { userId, search, categoryId, status, sort, page, limit } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await ProductService.getProducts({
    userId: userId as string, search: search as string, categoryId: categoryId as string,
    status: status as string, sort: sort as string,
    page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined,
  });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Products fetched", meta: result.meta, data: result.data });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await ProductService.getProductById(id as string, userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product fetched", data: result });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await ProductService.updateProduct(id as string, userId as string, req.body);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product updated", data: result });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await ProductService.deleteProduct(id as string, userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product deleted", data: result });
});

const restock = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const { quantity } = req.body;
  const result = await ProductService.restockProduct(id as string, userId as string, Number(quantity));
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Product restocked", data: result });
});

export const ProductController = { create, getAll, getOne, update, remove, restock };
