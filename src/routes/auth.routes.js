import { Router } from "express";
import { register, getUsers } from "../controllers/auth.controller.js";
const router = Router();

router.get("/register", register).get("/get-users", getUsers);

export default router;
