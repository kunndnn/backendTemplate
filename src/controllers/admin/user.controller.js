import { promiseHandler } from "#helpers/promiseHandler";
import { ErrorSend } from "#helpers/response";
import userModels from "#models/user.models";

export const usersListing = promiseHandler(async (req, res) => {
  const users = await userModels.find({ role: 1 }).lean();
  res.status(200).json(new SuccessSend(200, "Users listing", users));
});

export const userStatusChange = promiseHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findById(userId);
  if (!user) throw new ErrorSend(404, "User not found");
  let msg = "";
  if (user.isActive) {
    msg = "User in active succesfully";
    user.isActive = false;
  } else {
    msg = "User active succesfully";
    user.isActive = true;
  }
  await user.save();
  res.status(200).json(new SuccessSend(200, msg, user));
});

export const userDelete = promiseHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findByIdAndDelete(userId).lean();
  res.status(200).json(new SuccessSend(200, "User deleted successfully", user));
});

export const userDetail = promiseHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await userModels.findById(userId).lean();
  res.status(200).json(new SuccessSend(200, "User detail", user));
});
