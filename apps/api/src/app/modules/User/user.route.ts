import express from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", UserController.getAll);
router.patch("/:id/role", UserController.updateRole);

router.post("/", UserController.createUser);

export const UserRoutes = router;
