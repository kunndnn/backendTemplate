import { Router } from "express";
import { scheduleNotification, getScheduledNotifications } from "#controllers/admin/notification.controller";
import { verifyToken } from "#middlewares/verifyToken";

const router = Router();

router.use(verifyToken);

/**
 * @swagger
 * /admin/notification/schedule:
 *   post:
 *     summary: Schedule a push notification
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2024-03-25"
 *               time:
 *                 type: string
 *                 example: "10:30"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               targetUsers:
 *                 oneOf:
 *                   - type: string
 *                     enum: ["all"]
 *                   - type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Success
 */
router.post("/schedule", scheduleNotification);

/**
 * @swagger
 * /admin/notification/list:
 *   get:
 *     summary: Get scheduled notifications (Paginated)
 *     tags: [Admin Notifications]
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
router.get("/list", getScheduledNotifications);

export default router;
