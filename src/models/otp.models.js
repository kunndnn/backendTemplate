import mongoose,{ Schema, model } from "mongoose";
const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    ref: "user",
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

export default mongoose.models.Otp || model("Otp", otpSchema);
