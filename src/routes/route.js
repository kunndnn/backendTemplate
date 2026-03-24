import { Router } from "express";
const router = Router();
import userAuthRoute from "./user/auth.routes.js";
import adminAuthRoute from "./admin/auth.routes.js";
import dashboardRoute from "./admin/dashboard.routes.js";
import adminUserRoute from "./admin/user.routes.js";

// admin routes
router.use("/admin", adminAuthRoute);
router.use("/admin", dashboardRoute);
router.use("/admin", adminUserRoute);

// user routes
router.use("/user", userAuthRoute);

export default router;
