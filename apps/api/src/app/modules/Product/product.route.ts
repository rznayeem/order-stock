import express from "express";
import { ProductController } from "./product.controller";

const router = express.Router();
router.post("/", ProductController.create);
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getOne);
router.patch("/:id", ProductController.update);
router.patch("/:id/restock", ProductController.restock);
router.delete("/:id", ProductController.remove);

export const ProductRoutes = router;
