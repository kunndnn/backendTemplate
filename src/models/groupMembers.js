import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const groupMembers = new Schema(
  {
    groupId: {
      type: ObjectId,
      required: [true, "Group id is requried"],
      ref: "group",
    },
    userId: {
      type: ObjectId,
      required: [true, "User id is required"],
      ref: "users",
    },
  },
  { timestamps: true }
);

export default model("groupMembers", groupMembers);
