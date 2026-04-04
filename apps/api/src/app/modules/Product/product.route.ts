import express from "express";
import { ProductController } from "./product.controller";
import authMiddleware from "../../middlewares/authMiddleware";

const router = express.Router();

// Only authenticated users can view products
router.get("/", authMiddleware(), ProductController.getAll);
router.get("/:id", authMiddleware(), ProductController.getOne);

// Only managers and admins can modify products
router.post("/", authMiddleware("ADMIN", "MANAGER"), ProductController.create);
router.patch("/:id", authMiddleware("ADMIN", "MANAGER"), ProductController.update);
router.patch("/:id/restock", authMiddleware("ADMIN", "MANAGER"), ProductController.restock);
router.delete("/:id", authMiddleware("ADMIN", "MANAGER"), ProductController.remove);

export const ProductRoutes = router;

