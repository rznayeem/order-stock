import express from "express";
import { CategoryController } from "./category.controller";

const router = express.Router();
router.post("/", CategoryController.create);
router.get("/", CategoryController.getAll);
router.patch("/:id", CategoryController.update);
router.delete("/:id", CategoryController.remove);

export const CategoryRoutes = router;
