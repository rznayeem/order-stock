import express from "express";
import { OrderController } from "./order.controller";

const router = express.Router();
router.post("/", OrderController.create);
router.get("/", OrderController.getAll);
router.get("/:id", OrderController.getOne);
router.patch("/:id/status", OrderController.updateStatus);

export const OrderRoutes = router;
