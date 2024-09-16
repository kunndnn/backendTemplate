const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const groupMembers = new Schema(
  {
    groupId: {
      type: ObjectId,
      required: [true, "Group id is required"],
      ref: "group",
    },
    userid: {
      type: ObjectId,
      required: [true, "User id is required"],
    },
  },
  { timestamps: true }
);

module.exports = model("groupMembers", groupMembers);
