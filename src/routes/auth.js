import { Router } from "express";
const router = Router();

import { register } from "../controllers/authController.js";

router.route("/register").post(register);

export default router;
