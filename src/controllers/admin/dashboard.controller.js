import { promiseHandler } from "#helpers/promiseHandler";
import chatModels from "#models/chat.models";
import userModels from "#models/user.models";

export const dashboard = promiseHandler(async (req, res) => {
  const [userCount, activeUserCount, chatCount] = await Promise.all([
    userModels.countDocuments({ role: 1 }),
    userModels.countDocuments({ isOnline: true }),
    chatModels.countDocuments(),
  ]);
  const result = {
    userCount,
    activeUserCount,
    chatCount,
  };
  res.status(200).json(new SuccessSend(200, "Dashboard listing", result));
});
