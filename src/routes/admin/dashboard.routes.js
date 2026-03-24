import { dashboard } from "#controllers/admin/dashboard.controller";
import { verifyToken } from "#middlewares/verifyToken";
import { cacheMiddleware } from "#middlewares/cache";
import { Router } from "express";
const router = Router();

router.use(verifyToken);
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/dashboard", cacheMiddleware(60), dashboard);
export default router;
