import { dashboard } from "#controllers/admin/dashboard.controller";
import { verifyToken } from "#middlewares/verifyToken";
import { cacheMiddleware } from "#middlewares/cache";
import { Router } from "express";
const router = Router();

router.use(verifyToken);
router.get("/dashboard", cacheMiddleware(60), dashboard);
export default router;
