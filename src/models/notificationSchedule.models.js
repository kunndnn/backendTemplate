import { Schema, model } from "mongoose";

const notificationScheduleSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, "Date is required"],
    },
    time: {
      type: String, // Format: HH:mm
      required: [true, "Time is required"],
    },
    timezone: {
      type: String, // Optional: e.g., "Asia/Kolkata"
    },
    targetUsers: {
      type: Schema.Types.Mixed, // Array of UserIds or "all"
      required: [true, "Target users are required"],
      default: "all",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const NotificationSchedule = model("NotificationSchedule", notificationScheduleSchema);
export default NotificationSchedule;
