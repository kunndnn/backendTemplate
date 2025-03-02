import { Router } from "express";
const router = Router();
import { validationCheck, validateCheck } from "#middlewares/validationCheck";
import { upload } from "#middlewares/fileUpload";
import { verifyToken } from "#middlewares/verifyToken";
import {
  loginValidations,
  signupValidations,
  testValidations,
} from "#middlewares/validations/auth";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  profile,
  profileUpdate,
  changePass,
  testController,
} from "../controllers/authController.js";

router.route("/register").post(upload.single("image"), register); // register
router.route("/login").post(loginValidations, validationCheck, login); // login
router.route("/refresh-token").post(refreshAccessToken); // generate refresh token

router.route("/testing").get(testValidations, validateCheck, testController);

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logout); // logout
router
  .route("/profile")
  .get(profile) // get profile
  .post(upload.single("image"), profileUpdate); // update profile
router
  .route("/change-password")
  .post(signupValidations, validationCheck, changePass); //change password

export default router;
