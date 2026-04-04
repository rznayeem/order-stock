import express from "express";
import { CategoryController } from "./category.controller";
import authMiddleware from "../../middlewares/authMiddleware";

const router = express.Router();

// Only authenticated users can view categories
router.get("/", authMiddleware(), CategoryController.getAll);

// Only managers and admins can modify categories
router.post("/", authMiddleware("ADMIN", "MANAGER"), CategoryController.create);
router.patch("/:id", authMiddleware("ADMIN", "MANAGER"), CategoryController.update);
router.delete("/:id", authMiddleware("ADMIN", "MANAGER"), CategoryController.remove);

export const CategoryRoutes = router;

