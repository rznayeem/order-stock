import { Request, Response } from "express";
import httpStatus from "http-status";
import { OrderService } from "./order.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.createOrder(req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, success: true, message: "Order created successfully", data: result });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { userId, search, status, dateFrom, dateTo, sort, page, limit } = req.query;
  if (!userId) throw new Error("userId is required");
  const result = await OrderService.getOrders({
    userId: userId as string, search: search as string, status: status as string,
    dateFrom: dateFrom as string, dateTo: dateTo as string, sort: sort as string,
    page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined,
  });
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Orders fetched", meta: result.meta, data: result.data });
});

const getOne = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const result = await OrderService.getOrderById(id as string, userId as string);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "Order fetched", data: result });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.query;
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(id as string, userId as string, status);
  sendResponse(res, { statusCode: httpStatus.OK, success: true, message: `Order status updated to ${status}`, data: result });
});

export const OrderController = { create, getAll, getOne, updateStatus };
