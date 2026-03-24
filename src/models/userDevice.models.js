import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const userDeviceSchema = new Schema({
  userId: {
    type: ObjectId,
    required: [true, "User ID is required"],
    ref: "User",
  },
  deviceId: {
    type: String,
    required: [true, "Device ID is required"],
  },
  deviceType: {
    type: String,
    enum: ["android", "ios"],
    required: [true, "Device type is required"],
  },
  deviceToken: {
    type: String,
    required: [true, "Device token is required"],
  },
  timezone: {
    type: String,
    required: [true, "Timezone is required"],
  },
});

export default model("userDevice", userDeviceSchema);
