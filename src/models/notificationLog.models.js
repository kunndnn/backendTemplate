import { Schema, model } from "mongoose";

const notificationLogSchema = new Schema(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "NotificationSchedule",
      required: true,
    },
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: "UserDevice",
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const NotificationLog = model("NotificationLog", notificationLogSchema);
export default NotificationLog;
