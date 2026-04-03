import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", UserController.getAll);
router.patch("/:id/role", UserController.updateRole);

export const UserRoutes = router;
