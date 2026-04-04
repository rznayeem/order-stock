import express from "express";
import { UserController } from "./user.controller";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.schema";
import authMiddleware from "../../middlewares/authMiddleware";

const router = express.Router();

// Only authenticated users can list users
router.get("/", authMiddleware(), UserController.getAll);

// Only admins can update user roles
router.patch("/:id/role", authMiddleware("ADMIN"), validateRequest(UserValidation.updateRoleSchema), UserController.updateRole);

// Only admins can create new users manually
router.post("/", authMiddleware("ADMIN"), validateRequest(UserValidation.createUserSchema), UserController.createUser);

export const UserRoutes = router;

