import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const deleteChat = new Schema(
  {
    userId: {
      type: ObjectId,
      required: [true, "userId is required"],
      ref: "user",
    },
    roomId: {
      type: ObjectId,
      required: [true, "roomId is required"],
      ref: "chatRooms",
    },
  },
  { timestamps: true }
);

export default model("deleteChat", deleteChat);
