import chatRoomsModel from "#models/chatRoom.models";
import userModels from "#models/user.models";
import { convertObjectId } from "#helpers/convertObjectId";

export const getChatsListing = async (
  userObjId,
  offset = 0,
  limit = 10,
  search
) => {
  userObjId = convertObjectId(userObjId);

  const userSearchFilter = {};
  if (search && search.trim() !== "") {
    userSearchFilter.fullName = { $regex: search, $options: "i" };
  }

  const chats = await chatRoomsModel.aggregate([
    {
      $match: {
        $or: [{ senderId: userObjId }, { receiverId: userObjId }],
      },
    },

    // STEP 0: compute otherUserId explicitly
    {
      $addFields: {
        otherUserId: {
          $cond: [
            { $eq: ["$senderId", userObjId] },
            "$receiverId",
            "$senderId",
          ],
        },
      },
    },

    // STEP 1: Lookup delete timestamp
    {
      $lookup: {
        from: "deletechats",
        let: { roomId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$roomId", "$$roomId"] },
                  { $eq: ["$userId", userObjId] },
                ],
              },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 1 },
        ],
        as: "deletionInfo",
      },
    },
    {
      $addFields: {
        deletionTimestamp: {
          $arrayElemAt: ["$deletionInfo.createdAt", 0],
        },
      },
    },

    // STEP 2: Lookup the latest message after deletion timestamp
    {
      $lookup: {
        from: "chats",
        let: {
          roomId: "$_id",
          deletedAt: "$deletionTimestamp",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$roomId", "$$roomId"] },
                  {
                    $cond: [
                      { $ifNull: ["$$deletedAt", false] },
                      { $gt: ["$createdAt", "$$deletedAt"] },
                      true,
                    ],
                  },
                ],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 1,
              message: 1,
              type: 1,
              createdAt: 1,
            },
          },
        ],
        as: "chatMessage",
      },
    },
    { $unwind: "$chatMessage" },

    // STEP 3: Lookup "other user" directly
    {
      $lookup: {
        from: "users",
        localField: "otherUserId",
        foreignField: "_id",
        pipeline: [
          {
            $match: {
              ...userSearchFilter,
            },
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              image: 1,
            },
          },
        ],
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },

    // FINAL: sorting & pagination
    { $sort: { "chatMessage.createdAt": -1 } },
    { $skip: offset },
    { $limit: limit },
  ]);

  return chats;
};

export const users = async ({ page, limit, userId, search = "" }) => {
  const skip = (page - 1) * limit;
  const filter = { $and: [{ role: { $ne: 0 } }, { _id: { $ne: userId } }] };

  // if search is provided, add regex on fullName
  if (search && search.trim() !== "") {
    filter.$and.push({
      fullName: { $regex: search, $options: "i" }, // case-insensitive search
    });
  }

  const [items, total] = await Promise.all([
    userModels
      .find(filter)
      .select("_id fullName image")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(), // optional sort
    userModels.countDocuments(filter),
  ]);

  return {
    users: items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const generateTokens = async (userId) => {
  try {
    const user = await userModels.findById(userId),
      token = user.generatetoken(),
      refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { token, refreshToken };
  } catch (error) {
    throw new ErrorSend(
      500,
      "Something went wrong while generating referesh and access token",
      []
    );
  }
};

export const getGraphData = async (Model) => {
  const now = new Date();

  const currentYear = now.getFullYear();

  // ----- DATE RANGES -----
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear + 1, 0, 1);

  const monthStart = new Date(currentYear, now.getMonth(), 1);
  const monthEnd = new Date(currentYear, now.getMonth() + 1, 1);

  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  // ----- AGGREGATION -----
  const [result] = await Model.aggregate([
    {
      $facet: {
        yearly: [
          {
            $group: {
              _id: { $year: "$createdAt" },
              count: { $sum: 1 },
            },
          },
        ],

        monthly: [
          {
            $match: { createdAt: { $gte: yearStart, $lt: yearEnd } },
          },
          {
            $group: {
              _id: { $month: "$createdAt" },
              count: { $sum: 1 },
            },
          },
        ],

        daily: [
          {
            $match: { createdAt: { $gte: weekStart, $lt: weekEnd } },
          },
          {
            $group: {
              _id: { $dayOfWeek: "$createdAt" },
              count: { $sum: 1 },
            },
          },
        ],

        weekly: [
          {
            $match: { createdAt: { $gte: monthStart, $lt: monthEnd } },
          },
          {
            $project: {
              week: {
                $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] },
              },
            },
          },
          {
            $group: {
              _id: "$week",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  // ----- YEARLY -----
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const yearMap = Object.fromEntries(
    result.yearly.map((y) => [y._id, y.count])
  );

  const yearly = {
    label: years,
    values: years.map((y) => yearMap[y] || 0),
  };

  // ----- MONTHLY -----
  const monthMap = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [i + 1, 0])
  );
  result.monthly.forEach((m) => (monthMap[m._id] = m.count));

  const monthly = {
    label: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    values: Object.values(monthMap),
  };

  // ----- DAILY -----
  const weekMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  result.daily.forEach((d) => (weekMap[d._id] = d.count));

  const daily = {
    label: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    values: [
      weekMap[2],
      weekMap[3],
      weekMap[4],
      weekMap[5],
      weekMap[6],
      weekMap[7],
      weekMap[1],
    ],
  };

  // ----- WEEKLY -----
  const weekOfMonth = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.weekly.forEach((w) => (weekOfMonth[w._id] = w.count));

  const weekly = {
    label: ["Week1", "Week2", "Week3", "Week4", "Week5"],
    values: Object.values(weekOfMonth),
  };

  return { yearly, monthly, daily, weekly };
};

