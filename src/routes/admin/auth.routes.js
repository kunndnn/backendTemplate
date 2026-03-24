import { Router } from "express";
import {
  login,
  profile,
  refreshtoken,
  resetPassword,
  sendOTP,
  updatePassword,
  verifyOTP,
} from "#controllers/admin/auth.controller";
import { upload } from "#middlewares/fileUpload";
import { verifyToken } from "#middlewares/verifyToken";
const router = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router.post("/login", login);

/**
 * @swagger
 * /admin/send-otp:
 *   post:
 *     summary: Send OTP for admin password reset
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router.post("/send-otp", sendOTP);

/**
 * @swagger
 * /admin/verify-otp:
 *   post:
 *     summary: Verify admin OTP
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router.post("/verify-otp", verifyOTP);

/**
 * @swagger
 * /admin/reset-password:
 *   post:
 *     summary: Reset admin password
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /admin/refresh-token:
 *   post:
 *     summary: Refresh admin access token
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Success
 */
router.route("/refresh-token").post(refreshtoken); // generate refresh token

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Update admin profile
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router
  .route("/profile")
  .get(verifyToken, profile) // get profile
  .post(verifyToken, upload.single("image"), profile); // update profile

/**
 * @swagger
 * /admin/update-password:
 *   post:
 *     summary: Update admin password
 *     tags: [Admin Auth]
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
 *         description: Success
 */
router.post("/update-password", verifyToken, updatePassword);
export default router;
