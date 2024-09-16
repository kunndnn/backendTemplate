const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const group = new Schema(
  {
    name: { type: String, required: [true, "Group name is required"] },
    image: { type: String, default: null },
    createdBy: { type: ObjectId, required: [true, "Created by is required"] },
  },
  { timeseries: true }
);
module.exports = model("Group", group);
