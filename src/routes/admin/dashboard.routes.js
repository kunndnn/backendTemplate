import { dashboard } from "#controllers/admin/dashboard.controller";
import { Router } from "express";
const router = Router();

router.post('/dashboard',dashboard)
export default router;