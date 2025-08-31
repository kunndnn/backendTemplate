import { Types } from "mongoose";
const { ObjectId } = Types;
import chatRoomsModel from "#models/chatRoom.models";
import userModels from "#models/user.models";

export const getChatsListing = async (
  userObjId,
  offset = 0,
  limit = 10,
  search
) => {
  userObjId = new ObjectId(String(userObjId));

  const userFilter = {
    $match: {
      $expr: {
        $cond: [
          { $ne: ["$$senderId", userObjId] },
          { $eq: ["$_id", "$$senderId"] },
          { $eq: ["$_id", "$$receiverId"] },
        ],
      },
    },
  };

  if (search && search.trim() !== "") { // search by full name if search has value
    userFilter.$match.fullName = { $regex: search, $options: "i" };
  }
  const chats = await chatRoomsModel.aggregate([
    {
      $match: {
        $or: [{ senderId: userObjId }, { receiverId: userObjId }],
      },
    },
    // STEP 1: Lookup delete timestamp if exists
    {
      $lookup: {
        from: "deletechats", // collection name
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
          { $sort: { _id: -1 } }, // in case multiple delete records exist
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

    // STEP 3: Lookup user details (same as before)
    {
      $lookup: {
        from: "users",
        let: { senderId: "$senderId", receiverId: "$receiverId" },
        pipeline: [
          userFilter,
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

    // FINAL STEPS: pagination & sorting
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
      .sort({ createdAt: -1 }), // optional sort
    userModels.countDocuments(filter),
  ]);

  return {
    users: items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
