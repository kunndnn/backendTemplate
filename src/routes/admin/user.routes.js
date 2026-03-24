import {
  userDelete,
  userDetail,
  usersListing,
  userStatusChange,
} from "#controllers/admin/user.controller";
import { Router } from "express";
const router = Router();

/**
 * @swagger
 * /admin/user-list:
 *   post:
 *     summary: List users (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /admin/user-get/{userId}:
 *   get:
 *     summary: Get user details (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /admin/user-delete/{userId}:
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /admin/user-status-toggle/{userId}:
 *   patch:
 *     summary: Toggle user status (Admin)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

router
  .post('/user-list', usersListing)
  .get("/user-get/:userId", userDetail)
  .delete("/user-delete/:userId", userDelete)
  .patch("/user-status-toggle/:userId", userStatusChange);

export default router;
