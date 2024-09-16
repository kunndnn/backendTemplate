import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const chats = new Schema(
  {
    senderId: {
      //msg sent by
      type: ObjectId,
      required: [true, "senderId is required"],
      ref: "User",
    },
    roomId: {
      // room Id
      type: ObjectId,
      required: [true, "roomId is required"],
      ref: "ChatRooms",
    },
    roomType: {
      // single chat || group chat
      type: String,
      enum: ["single", "group"],
      default: "single",
    },
    message: {
      // message
      type: String,
      default: null,
    },
    type: {
      // message type
      type: String,
      enum: ["text", "file", "both"],
      require: [true, "message type is required"],
    },
    attachment: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default model("Chats", chats);
