import { Router } from "express";
const router = Router();
import { body, query } from "express-validator";
import { validationCheck } from "#middlewares/validationCheck";
import { verifyToken } from "#middlewares/verifyToken";
import {
  register,
  login,
  refreshAccessToken,
  logout,
} from "../controllers/authController.js";

router.route("/register").post(register);
router
  .route("/login")
  .post(
    body("password").notEmpty().withMessage("Please enter password"),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    validationCheck,
    login
  );
router.route("/refresh-token").post(refreshAccessToken);

router.use(verifyToken); // verify access token for the below routes
router.route("/logout").post(logout);

export default router;
