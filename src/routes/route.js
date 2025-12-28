import { Router } from "express";
const router = Router();
import userAuthRoute from "./user/auth.routes.js";
import adminAuthRoute from "./admin/auth.routes.js";
import dashboardRoute from "./admin/dashboard.routes.js";

// admin routes
router.use("/admin", adminAuthRoute);
router.use("/admin", dashboardRoute);

// user routes
router.use("/user", userAuthRoute);

export default router;
