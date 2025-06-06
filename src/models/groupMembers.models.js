import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;

const groupMember = new Schema(
  {
    groupId: {
      type: ObjectId,
      required: [true, "Group id is requried"],
      ref: "group",
    },
    userId: {
      type: ObjectId,
      required: [true, "User id is required"],
      ref: "user",
    },
  },
  { timestamps: true }
);

export default model("groupMember", groupMember);
