import { Schema, model } from "mongoose";
const { ObjectId } = Schema.Types;
const group = new Schema(
  {
    name: { type: String, required: [true, "Group name is required"] },
    image: { type: String, default: null },
    createdBy: { type: ObjectId, required: [true, "Created by is required"] },
  },
  { timestamps: true }
);

export default model("group", group);
