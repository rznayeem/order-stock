import { Request, Response } from "express";
import httpStatus from "http-status";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { search, role, page, limit } = req.query;
  const result = await UserService.getUsers({
    search: search as string,
    role: role as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  
  sendResponse(res, { 
    statusCode: httpStatus.OK, 
    success: true, 
    message: "Users fetched successfully", 
    meta: result.meta, 
    data: result.data 
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.query.userId as string; // Current user ID making the request
  const role = req.body.role;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const result = await UserService.updateUserRole(id, userId, role);

  sendResponse(res, { 
    statusCode: httpStatus.OK, 
    success: true, 
    message: `User role updated to ${role}`, 
    data: result 
  });
});

const createUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.query.userId as string; // Current user ID (Admin)
  if (!userId) {
    throw new Error("User ID is required");
  }

  const result = await UserService.createUser(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

export const UserController = { getAll, updateRole, createUser };
