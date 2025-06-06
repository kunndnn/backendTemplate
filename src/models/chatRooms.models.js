import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const chatRoom = new Schema(
  {
    senderId: {
      type: ObjectId,
      required: [true, "senderId is required"],
      ref: "user",
    },
    receiverId: {
      type: ObjectId,
      required: [true, "receiverId is required"],
      ref: "user",
    },
  },
  { timestamps: true }
);

export default model("chatRoom", chatRoom);
