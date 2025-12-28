import { promiseHandler } from "#helpers/promiseHandler";
import { SuccessSend } from "#helpers/response";
import chatModels from "#models/chat.models";
import userModels from "#models/user.models";
import { getGraphData } from "#services/dbQueries";

export const dashboard = promiseHandler(async (req, res) => {
  const [userCount, activeUserCount, chatCount, userStats, chatStats] =
    await Promise.all([
      userModels.countDocuments({ role: 1 }),
      userModels.countDocuments({ isOnline: true }),
      chatModels.countDocuments(),
      getGraphData(userModels),
      getGraphData(chatModels),
    ]);

  const result = {
    userCount,
    activeUserCount,
    chatCount,
    userStats,
    chatStats,
  };

  res.status(200).json(new SuccessSend(200, "Dashboard stats", result));
});
