import express from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();
router.get("/", DashboardController.getStats);

export const DashboardRoutes = router;
