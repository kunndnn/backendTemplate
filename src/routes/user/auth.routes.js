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
  forgetPassValids,
  verifyOtpValids,
  resetPassValids,
  logoutValids,
} from "#middlewares/validations/auth";

import {
  register,
  login,
  socialLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  refreshtoken,
  logout,
  profile,
  changePass,
  usersListing,
} from "../../controllers/user/auth.controller.js";

import { test } from "../../controllers/testController.js";

/**
 * @swagger
 * /user/test:
 *   get:
 *     summary: Test endpoint
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               deviceId:
 *                 type: string
 *               deviceType:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               timezone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User Registered Successfully
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               deviceType:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged In Successfully
 */

/**
 * @swagger
 * /user/social-login:
 *   post:
 *     summary: Social login
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               socialId:
 *                 type: string
 *               socialType:
 *                 type: string
 *               image:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               deviceType:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *               timezone:
 *                 type: string
 *     responses:
 *       200:
 *         description: User Login Successfully
 */

/**
 * @swagger
 * /user/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to the email
 */

/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP matched successfully
 */

/**
 * @swagger
 * /user/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [User Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User Auth]
 *     responses:
 *       200:
 *         description: Token regenerated successfully
 */

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: User logout
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               deviceType:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logout Successfully
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *   post:
 *     summary: Update user profile
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change password
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */

/**
 * @swagger
 * /user/users:
 *   get:
 *     summary: List users
 *     tags: [User Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users listing
 */

router.route("/test").get(testValidations, validateCheck, test);
router.route("/register").post(upload.single("image"), register); // register
router.route("/login").post(loginValidations, validationCheck, login); // login
router
  .route("/social-login")
  .post(socialLoginValidations, validateCheck, socialLogin); // social login

router
  .route("/forgot-password")
  .post(forgetPassValids, validateCheck, forgotPassword);
router.route("/verify-otp").post(verifyOtpValids, validateCheck, verifyOTP);
router
  .route("/reset-password")
  .post(resetPassValids, validateCheck, resetPassword);

router.route("/refresh-token").post(refreshtoken); // generate refresh token

router.use(verifyToken); // middleware to verify access token for the below routes
router.route("/logout").post(logoutValids, validateCheck, logout); // logout
router
  .route("/profile")
  .get(profile) // get profile
  .post(upload.single("image"), profile); // update profile
router
  .route("/change-password")
  .post(signupValidations, validationCheck, changePass); //change password

router.route("/users").get(usersListing);
export default router;
