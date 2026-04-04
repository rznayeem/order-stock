import express from "express";
import { ActivityController } from "./activity.controller";

const router = express.Router();
router.get("/", ActivityController.getAll);

export const ActivityRoutes = router;
