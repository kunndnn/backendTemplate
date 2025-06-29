import { Types } from "mongoose";
const { ObjectId } = Types;
import chatRoomsModel from "#models/chatRoom.models";
import chatsModel from "#models/chat.models";
import userModels from "#models/user.models";
import deleteChatModels from "#models/deleteChat.models";
import pinnedChatsModels from "#models/pinnedChat.models";
import { SuccessSend, ErrorSend } from "#helpers/response";
import { getChatsListing } from "../../utils/services/dbQueries.js";
import { fcmNotify } from "#helpers/fcmNotify";
// to emit the error
const emitError = (socketType = "error", err, socket, statusCode = 500) =>
  socket.emit(
    socketType,
    new ErrorSend(statusCode, "Error sending message", err.message)
  );

export const userHandler = async (io, socket) => {
  // socket.on("test", (data) => {
  //   io.emit("test", `hello ${data.name} !!!`);
  // });

  //users listing
  socket.on("chatsListing", async (body) => {
    /* 
    {
      "userId": "669558bd39b95bb57db786d7",
      "page":1,
      "limit":10
    }
      */
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { userId, limit = 10, page = 1 } = body;
      const offset = (page - 1) * limit;

      const chats = await getChatsListing(userId, offset, limit);
      // console.log({ chats });
      // return socket.emit("chatsListing", chats);
      const data = { chats, limit, page };
      socket.join(String(userId)); // join room
      io.to(userId).emit(
        "chatsListing",
        new SuccessSend(200, "chats listing", data)
      );
    } catch (error) {
      emitError("chatsListing", error, socket);
    }
  });

  // join the room and send all the chats till now
  socket.on("roomJoin", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body); // convert to JSON
      const { senderId, receiverId, limit = 10, page = 1 } = body;
      let roomId;
      // check if room exist or not
      const roomFound = await chatRoomsModel.findOne({
        $or: [
          {
            $and: [
              { senderId: new ObjectId(String(senderId)) },
              { receiverId: new ObjectId(String(receiverId)) },
            ],
          },
          {
            $and: [
              { senderId: new ObjectId(String(receiverId)) },
              { receiverId: new ObjectId(String(senderId)) },
            ],
          },
        ],
      });

      // if room not exist then send response
      if (!roomFound) {
        return socket.emit(
          "roomJoin",
          new SuccessSend(204, "No messages yet", null)
        );
      }

      roomId = String(roomFound._id);
      const deleteDate = await deleteChatModels
        .findOne({
          $and: [
            { userId: new ObjectId(String(senderId)) },
            { roomId: new ObjectId(String(roomId)) },
          ],
        })
        .sort({ _id: -1 });
      const offset = (page - 1) * limit;

      let filter = { roomId: new ObjectId(roomId) };
      if (deleteDate) {
        filter = {
          $and: [
            { roomId: new ObjectId(String(roomId)) },
            { createdAt: { $gt: new Date(deleteDate.createdAt) } },
          ],
        };
      }

      //show chats after deleted date
      const chats = await chatsModel
        .find(filter)
        .populate("senderId", "fullName image") // get only mention fields
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 });

      socket.join(roomId);
      const data = { roomId, chats, limit, page };
      io.to(roomId).emit(
        "roomJoin",
        new SuccessSend(200, "Messages listing", data)
      );
    } catch (error) {
      emitError("roomJoin", error, socket);
      console.log({ error });
    }
  });

  // send message
  socket.on("message", async (body) => {
    //     {
    //     "senderId": "",
    //     "roomId": "",
    //     "roomType": "",
    //     "message": "",
    //     "type": ""
    // }
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { senderId, roomId, roomType, message, type } = body;

      // Validate room existence
      const roomExists = await chatRoomsModel.findById(roomId);
      if (!roomExists) {
        return socket.emit(
          "message",
          new ErrorSend(404, "Chat room does not exist", null)
        );
      }

      const [chat, devices] = await Promise.all([
        chatsModel.create({
          senderId,
          roomId,
          roomType,
          message,
          type,
        }),

        chatRoomsModel.findById(roomId).populate({
          path: "receiverId",
          // the virtual field from user schema
          populate: { path: "devices" },
        }),
      ]);

      // notify to every device
      devices?.receiverId?.devices.map(
        async (device) => await fcmNotify(device?.deviceToken)
      );
      //join room
      const room = String(roomId);
      socket.join(room);
      // emit response
      io.to(room).emit("message", new SuccessSend(200, "message", chat));
      let userId = String(roomExists.receiverId);
      const chats = await getChatsListing(userId);
      const data = { chats, limit: 0, page: 10 };
      socket.join(userId); // join room
      io.to(userId).emit(
        "chatsListing",
        new SuccessSend(200, "chats listing", data)
      );
    } catch (error) {
      emitError("message", error, socket);
    }
  });

  //update online status
  socket.on("onlineStatus", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { userId, isOnline } = body;

      // not a bool value then throw error
      if (typeof isOnline !== "boolean")
        throw new Error("Invalid online status");

      // Update user status, setting lastOnline only when the user goes offline
      const update = {
        isOnline,
        ...(isOnline === false && { lastOnline: Date.now() }), // Add `lastOnline` only if `isOnline` is false
      };
      const details = await userModels
        .findByIdAndUpdate(userId, update, { new: true })
        .select("_id isOnline lastOnline");
      if (!details) throw new Error("User not found");

      const result = {
        userId: details._id,
        isOnline: details.isOnline,
        lastOnline: details.lastOnline,
      };

      // to all clients in the current namespace except the sender
      socket.broadcast.emit(
        "onlineStatus",
        new SuccessSend(200, "Onine status updated", result)
      );
    } catch (error) {
      emitError("onlineStatus", error, socket);
    }
  });

  // pin/unpin chat
  socket.on("pinChat", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { userId, pinChatId, type, chatType } = body;
      const userObjId = new ObjectId(String(userId)),
        pinnedChat = new ObjectId(String(pinChatId));

      let msg = "chat pinned successfully";

      if (type === "pin") {
        const [pinnedCount, pinnedAlready] = await Promise.all([
          pinnedChatsModels.countDocuments({ userId: userObjId }),
          pinnedChatsModels.findOne({ userId: userObjId, pinnedChat }),
        ]);

        if (pinnedCount >= 3) {
          msg = "You can pin up to 3 chats only";
        } else if (pinnedAlready) {
          msg = "Chat already pinned";
        } else {
          // Pin the chat if the limit is not exceeded
          await pinnedChatsModels.create({
            userId: userObjId,
            pinnedChat,
            chatType,
          });
        }
      } else if (type === "unpin") {
        // Unpin chat
        await pinnedChatsModels.findOneAndDelete({
          userId: userObjId,
          pinnedChat,
        });
        msg = "chat unpinned successfully";
      }
      socket.emit("pinChat", new SuccessSend(200, msg, {}));
    } catch (error) {
      console.log({ error });
      emitError("pinChat", error, socket);
    }
  });

  // search messages
  socket.on("msgSearch", async (body) => {
    /*
    {
    userId:"669ba7db0f5738196b8127cb",
    message:"he"
    }
    */
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { userId, message } = body;
      const userObjId = new ObjectId(String(userId));

      const msgMatches = await chatsModel.aggregate([
        {
          $lookup: {
            from: "chatrooms",
            localField: "roomId",
            foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $or: [{ senderId: userObjId }, { receiverId: userObjId }],
                },
              },
              {
                $project: {
                  _id: 1,
                },
              },
            ],
            as: "rooms",
          },
        },
        {
          $unwind: {
            path: "$rooms", // Unwind the "rooms" array
            preserveNullAndEmptyArrays: false, // Optional: Retain documents with no matches in "rooms"
          },
        },
        {
          $match: {
            message: {
              $regex: `.*${message}.*`,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "senderId",
            foreignField: "_id",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  fullName: 1,
                  email: 1,
                  image: 1,
                },
              },
            ],
            as: "sender",
          },
        },
        {
          $unwind: "$sender", // Unwind the "rooms" array
        },
      ]);
      socket.emit(
        "msgSearch",
        new SuccessSend(200, "message retrived successfully", msgMatches)
      );
    } catch (error) {
      console.log({ error });
      emitError("msgSearch", error, socket);
    }
  });

  //search messages
  socket.on("searchedMsg", async (body) => {
    /*
    {
    msgId:"669ba7db0f5738196b8127cb"
    }
    */
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { msgId } = body;
      const msgObjId = new ObjectId(String(msgId));

      const msgMatches = await chatsModel
        .aggregate([
          {
            $facet: {
              oldMsgs: [
                { $match: { _id: { $lt: msgObjId } } },
                { $sort: { _id: -1 } }, // Sort old messages in descending order (latest first)
                { $limit: 5 }, // Limit to 5 previous messages
              ],
              newMsgs: [
                { $match: { _id: { $gt: msgObjId } } },
                { $sort: { _id: 1 } }, // Sort new messages in ascending order (oldest first)
                { $limit: 5 }, // Limit to 5 upcoming messages
              ],
              currentMsg: [{ $match: { _id: msgObjId } }],
            },
          },
          {
            $project: {
              messages: {
                // Merge old, current, and new messages
                $concatArrays: ["$oldMsgs", "$currentMsg", "$newMsgs"],
              },
            },
          },
          { $unwind: "$messages" }, // Unwind the merged messages to process each individually
          {
            $lookup: {
              from: "users", // User collection
              localField: "messages.senderId", // Match senderId in messages
              foreignField: "_id", // Match the _id of users
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    image: 1,
                  },
                },
              ],
              as: "userDetails", // Store user details for each message
            },
          },
          { $unwind: "$userDetails" }, // Unwind the userDetails array (since it's always an array of 1 user)
          {
            $addFields: {
              "messages.userDetails": "$userDetails", // Add user details to each message
            },
          },
          {
            $group: {
              _id: null, // No grouping, just flatten messages into an array
              messages: { $push: "$messages" }, // Push all the messages into an array
            },
          },
          {
            $replaceRoot: {
              newRoot: { messages: "$messages" }, // Replace the root with the messages array directly
            },
          },
        ])
        .then((data) => data[0]);

      socket.emit(
        "searchedMsg",
        new SuccessSend(200, "searched message", msgMatches)
      );
    } catch (error) {
      console.log({ error });
      emitError("searchedMsg", error, socket);
    }
  });

  //delete chat for the self
  socket.on("deleteChat", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { userId, roomId } = body;
      await deleteChatModels.create({ userId, roomId });
      socket.emit("deleteChat", new SuccessSend(200, "chat deleted"));
    } catch (error) {
      console.log({ error });
      emitError("deleteChat", error, socket);
    }
  });

  // on disconnect
  socket.on("disconnect", () => {
    console.log(socket.id, "user disconnected");
  });
};
