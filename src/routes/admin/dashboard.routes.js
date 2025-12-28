import { dashboard } from "#controllers/admin/dashboard.controller";
import { verifyToken } from "#middlewares/verifyToken";
import { Router } from "express";
const router = Router();

router.use(verifyToken);
router.get("/dashboard", dashboard);
export default router;
