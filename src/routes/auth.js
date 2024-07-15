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
  profileUpdate,
  changePass,
} from "../controllers/authController.js";

router.route("/register").post(upload.single("image"), register); // register
router
  .route("/login")
  .post(
    body("password").notEmpty().withMessage("Please enter password"),
    body("email").notEmpty().withMessage("Please enter email").escape().trim(),
    validationCheck,
    login
  ); // login
router.route("/refresh-token").post(refreshAccessToken); // geenrate refresh token

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logout); // logout
router.route("/profile").get(profile); // get profile
router.route("/profile").post(upload.single("image"), profileUpdate); // get profile
router.route("/changePassword").post(
  body("password").notEmpty().withMessage("Please enter old password"),
  body("newPassword").notEmpty().withMessage("Please enter newPassword"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Please enter confirmPassword")
    .custom(async (confirmPassword, { req }) => {
      const { newPassword } = req.body;
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords must be same");
      }
    }),
  validationCheck,
  changePass
); //change password

export default router;
