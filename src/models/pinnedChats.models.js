import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const pinned = new Schema(
  {
    // user who pinned the chats
    userId: { type: ObjectId, required: [true, "User Id is required"] },
    // pinned users/groups
    pinnedChat: {
      type: ObjectId,
      required: [true, "Pinned chat Id is required"],
    },
    //pinned type can be user or group
    chatType: {
      type: String,
      enum: ["user", "group"],
      require: [true, "Pinned type is required"],
    },
  },
  { timestamps: true }
);

export default model("pinnedChat", pinned);
