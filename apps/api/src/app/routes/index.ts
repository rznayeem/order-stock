import { Router } from "express";
import { CategoryRoutes } from "../modules/Category/category.route";
import { ProductRoutes } from "../modules/Product/product.route";
import { OrderRoutes } from "../modules/Order/order.route";
import { RestockRoutes } from "../modules/RestockQueue/restock.route";
import { DashboardRoutes } from "../modules/Dashboard/dashboard.route";
import { ActivityRoutes } from "../modules/ActivityLog/activity.route";
import { UserRoutes } from "../modules/User/user.route";
import authMiddleware from "../middlewares/authMiddleware";

const router: Router = Router();

const moduleRoutes = [
  { path: "/categories", route: CategoryRoutes },
  { path: "/products", route: ProductRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/restock-queue", route: RestockRoutes },
  { path: "/dashboard", route: DashboardRoutes },
  { path: "/activity-logs", route: ActivityRoutes },
  { path: "/users", route: UserRoutes },
];

// Apply authMiddleware globally to all protected module routes
moduleRoutes.forEach((route) => router.use(route.path, authMiddleware(), route.route));

export default router;

