import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const userDeviceSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: "User",
  },
  deviceId: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    enum: ["android", "ios"],
    required: true,
  },
  deviceToken: {
    type: String,
    required: true,
  },
});

export default model("userDevice", userDeviceSchema);
