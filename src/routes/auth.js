import { Router } from "express";
const router = Router();
import { body, query } from "express-validator";
import { validationCheck } from "#middlewares/validationCheck";
import { upload } from "#middlewares/fileUpload";
import { verifyToken } from "#middlewares/verifyToken";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  profile,
} from "../controllers/authController.js";

router.route("/register").post(upload.single("profile"), register);
router
  .route("/login")
  .post(
    body("password").notEmpty().withMessage("Please enter password"),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    validationCheck,
    login
  );
router.route("/refresh-token").post(refreshAccessToken);

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logout);
router.route("/profile").get(profile);

export default router;
