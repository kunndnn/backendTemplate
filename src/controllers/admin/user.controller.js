import { ErrorSend, SuccessSend } from "#helpers/response";
import userModels from "#models/user.models";
import httpStatus from "http-status";

export const usersListing = async (req, res) => {
  const users = await userModels.find({ role: 1 }).lean();
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Users listing", users));
};

export const userStatusChange = async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findById(userId);
  if (!user) throw new ErrorSend(httpStatus.NOT_FOUND, "User not found");
  
  let msg = "";
  if (user.isActive) {
    msg = "User in active succesfully";
    user.isActive = false;
  } else {
    msg = "User active succesfully";
    user.isActive = true;
  }
  await user.save();
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, msg, user));
};

export const userDelete = async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findByIdAndDelete(userId).lean();
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "User deleted successfully", user));
};

export const userDetail = async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findById(userId).lean();
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "User detail", user));
};
