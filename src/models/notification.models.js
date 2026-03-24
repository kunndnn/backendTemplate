import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "NotificationSchedule",
    },
  },
  { timestamps: true }
);

const Notification = model("Notification", notificationSchema);
export default Notification;
