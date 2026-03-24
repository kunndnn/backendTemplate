import cron from "node-cron";
import moment from "moment-timezone";
import NotificationSchedule from "#models/notificationSchedule.models";
import NotificationLog from "#models/notificationLog.models";
import UserDevice from "#models/userDevice.models";
import Notification from "#models/notification.models";
import { sendPushNotification } from "#helpers/pushNotify";

const processSchedules = async () => {
  try {
    const nowUtc = moment.utc();
    // Find pending schedules
    const pendingSchedules = await NotificationSchedule.find({ status: "pending" });

    for (const schedule of pendingSchedules) {
      const { _id, title, body, date, time, timezone, targetUsers } = schedule;
      const scheduledAtStr = `${date} ${time}`;

      if (timezone) {
        // Case A: Admin specified timezone
        const nowInAdminTz = moment().tz(timezone);
        const scheduledInAdminTz = moment.tz(scheduledAtStr, "YYYY-MM-DD HH:mm", timezone);

        if (nowInAdminTz.isSameOrAfter(scheduledInAdminTz)) {
          console.warn(`[Cron] Processing schedule ${_id} (Admin TZ: ${timezone})`);
          
          let devices = [];
          let userIds = [];
          if (targetUsers === "all") {
            devices = await UserDevice.find().lean();
            userIds = devices.map(d => d.userId);
          } else {
            devices = await UserDevice.find({ userId: { $in: targetUsers } }).lean();
            userIds = targetUsers;
          }

          const tokens = devices.map(d => d.deviceToken).filter(Boolean);
          
          // Send push notifications
          await Promise.all(tokens.map(token => sendPushNotification(token, title, body)));

          // Save persistent notifications for each user
          const uniqueUserIds = [...new Set(userIds.map(id => String(id)))];
          await Notification.insertMany(
            uniqueUserIds.map(uid => ({
              userId: uid,
              title,
              description: body,
              scheduleId: _id,
            }))
          );

          schedule.status = "completed";
          await schedule.save();
          console.warn(`[Cron] Completed schedule ${_id}`);
        }
      } else {
        // Case B: Deliver at device's local time
        console.warn(`[Cron] Processing schedule ${_id} (Device Local Time)`);
        
        let devices = [];
        if (targetUsers === "all") {
          devices = await UserDevice.find().lean();
        } else {
          devices = await UserDevice.find({ userId: { $in: targetUsers } }).lean();
        }

        let allDelivered = true;
        const targetDateTime = moment(scheduledAtStr, "YYYY-MM-DD HH:mm"); // Naive time

        for (const device of devices) {
          const alreadyLogged = await NotificationLog.findOne({ scheduleId: _id, deviceId: device._id });
          if (alreadyLogged) continue;

          const deviceTimezone = device.timezone || "UTC";
          const nowInDeviceTz = moment().tz(deviceTimezone);
          const scheduledInDeviceTz = moment.tz(scheduledAtStr, "YYYY-MM-DD HH:mm", deviceTimezone);

          if (nowInDeviceTz.isSameOrAfter(scheduledInDeviceTz)) {
            // Send push
            await sendPushNotification(device.deviceToken, title, body);
            await NotificationLog.create({ scheduleId: _id, deviceId: device._id });

            // Save persistent notification for the user (only if not already created for this schedule)
            const exists = await Notification.findOne({ userId: device.userId, scheduleId: _id });
            if (!exists) {
              await Notification.create({
                userId: device.userId,
                title,
                description: body,
                scheduleId: _id,
              });
            }
            
            console.warn(`[Cron] Delivered schedule ${_id} to device ${device._id} (${deviceTimezone})`);
          } else {
            allDelivered = false;
          }
        }

        // Auto-complete if it's way past the target time (e.g. 48 hours) to prevent haunting
        const isExpired = moment().isAfter(targetDateTime.add(48, 'hours'));
        if (allDelivered || isExpired) {
          schedule.status = "completed";
          await schedule.save();
          console.warn(`[Cron] Completed schedule ${_id} (Device Local)`);
        }
      }
    }
  } catch (error) {
    console.error("[Cron] Error processing schedules:", error);
  }
};

const cronJobs = () => {
  // runs every minute
  cron.schedule("* * * * *", () => {
    processSchedules();
  });
};

export default cronJobs;
