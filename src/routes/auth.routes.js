import { Router } from "express";
const router = Router();
import { validationCheck, validateCheck } from "#middlewares/validationCheck";
import { upload } from "#middlewares/fileUpload";
import { verifyToken } from "#middlewares/verifyToken";
import {
  loginValidations,
  signupValidations,
  socialLoginValidations,
  testValidations,
} from "#middlewares/validations/auth";

import {
  register,
  login,
  socialLogin,
  refreshAccessToken,
  logout,
  profile,
  changePass,
} from "../controllers/authController.js";

import { test } from "../controllers/testController.js";

router.route("/test").get(testValidations, validateCheck, test);
router.route("/register").post(upload.single("image"), register); // register
router.route("/login").post(loginValidations, validationCheck, login); // login
router
  .route("/social-login")
  .post(socialLoginValidations, validateCheck, socialLogin); // social login
router.route("/refresh-token").post(refreshAccessToken); // generate refresh token

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logout); // logout
router
  .route("/profile")
  .get(profile) // get profile
  .post(upload.single("image"), profile); // update profile
router
  .route("/change-password")
  .post(signupValidations, validationCheck, changePass); //change password

export default router;
