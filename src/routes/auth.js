import { Router } from "express";
const router = Router();

import { register, logout } from "../controllers/authController.js";

router.route("/register").post(register);
router.route("/logout").post(logout);

export default router;
