const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;
const chatRooms = new Schema(
  {
    senderid: {
      type: ObjectId,
      required: [true, "SenderId is required"],
      ref: "User",
    },
    receiverId: {
      type: ObjectId,
      required: [true, "receiverId is required"],
      ref: "User",
    },
  },
  { timeseries: true }
);

module.exports = model("ChatRooms", chatRooms);
