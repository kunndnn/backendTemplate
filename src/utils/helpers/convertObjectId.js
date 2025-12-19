import { Types } from "mongoose";
const { ObjectId } = Types;
export const convertObjectId = (id) => new ObjectId(String(id));
