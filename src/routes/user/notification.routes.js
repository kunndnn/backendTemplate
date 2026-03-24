import { Router } from "express";
import { getNotifications, markAsRead, deleteNotification } from "#controllers/user/notification.controller";
import { verifyToken } from "#middlewares/verifyToken";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /user/notification/list:
 *   get:
 *     summary: Get user notifications (Paginated)
 *     tags: [User Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/list", getNotifications);

/**
 * @swagger
 * /user/notification/read/{id}:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [User Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.patch("/read/:id", markAsRead);

/**
 * @swagger
 * /user/notification/delete/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [User Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete("/delete/:id", deleteNotification);

export default router;
