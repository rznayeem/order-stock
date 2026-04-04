import express from "express";
import { RestockController } from "./restock.controller";

const router = express.Router();
router.get("/", RestockController.getAll);
router.delete("/:id", RestockController.remove);

export const RestockRoutes = router;
