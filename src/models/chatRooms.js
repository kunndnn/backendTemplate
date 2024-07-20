import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const chatRooms = new Schema(
  {
    senderId: {
      type: ObjectId,
      required: [true, "senderId is required"],
      ref: "User",
    },
    receiverId: {
      type: ObjectId,
      required: [true, "receiverId is required"],
      ref: "User",
    },
  },
  { timestamps: true }
);

export default model("ChatRooms", chatRooms);
