import { Types } from "mongoose";
import chatRoomsModel from "#models/chatRooms.models";
import chatsModel from "#models/chats.models";
import userModels from "#models/user.models";
import pinnedChatsModels from "#models/pinnedChats.models";
import { SuccessSend, ErrorSend } from "#helpers/response";

// to emit the error
const emitError = (socketType = "error", err, socket, statusCode = 500) =>
  socket.emit(
    "error",
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
      const { userId } = body;
      const limit = body.limit || 10,
        page = body.page || 1;
      const offset = (page - 1) * limit;

      const userObjId = new Types.ObjectId(String(userId));
      const chats = await chatRoomsModel.aggregate([
        {
          $match: {
            $or: [{ senderId: userObjId }, { receiverId: userObjId }],
          },
        },
        {
          $lookup: {
            from: "users", // name of the users collection
            let: { senderId: "$senderId", receiverId: "$receiverId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $cond: [
                      { $ne: ["$$senderId", userObjId] },
                      { $eq: ["$_id", "$$senderId"] },
                      { $eq: ["$_id", "$$receiverId"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  fullName: 1, // assuming you want to get the fullName from the users collection
                  image: 1, // and image from the users collection
                  // Add other fields you want to project
                },
              },
            ],
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" }, // Unwind the userDetails array
        {
          $lookup: {
            from: "chats",
            localField: "_id",
            foreignField: "roomId",
            as: "chatMessage",
            // to apply conditions within the lookup
            pipeline: [
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
              {
                $project: {
                  _id: 1,
                  message: 1,
                  type: 1,
                  createdAt: {
                    $dateToString: {
                      format: "%Y-%m-%d %H:%M:%S",
                      date: "$createdAt",
                    },
                  }, // format the date
                },
              },
            ],
          },
        },
        { $unwind: "$chatMessage" },
        { $skip: offset }, // skip users listing
        { $limit: limit }, // limit per page users
        { $sort: { _id: -1 } }, // sorting in descending order
      ]);
      const data = { chats, limit, page };
      socket.emit("chatsListing", new SuccessSend(200, "chats listing", data));
    } catch (error) {
      emitError("chatsListing", error, socket);
    }
  });

  // join the room and send all the chats till now
  socket.on("roomJoin", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body); // convert to JSON
      const { senderId, receiverId } = body;
      let roomId;
      const roomFound = await chatRoomsModel.findOne({
        $or: [
          {
            $and: [
              { senderId: new Types.ObjectId(String(senderId)) },
              { receiverId: new Types.ObjectId(String(receiverId)) },
            ],
          },
          {
            $and: [
              { senderId: new Types.ObjectId(String(receiverId)) },
              { receiverId: new Types.ObjectId(String(senderId)) },
            ],
          },
        ],
      });
      if (!roomFound) {
        // roomId found then send room
        const room = await chatRoomsModel.create({ senderId, receiverId });
        roomId = String(room._id);
      } else {
        roomId = String(roomFound._id);
      }

      const limit = body.limit || 10,
        page = body.page || 1;
      const offset = (page - 1) * limit;
      const chats = await chatsModel
        .find({
          roomId: new Types.ObjectId(roomId),
        })
        .populate("senderId", "fullName image")
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 });

      //join room
      socket.join(roomId);
      const data = { roomId, chats, limit, page };
      io.to(roomId).emit(
        "roomJoin",
        new SuccessSend(200, "messages listing", data)
      );
    } catch (error) {
      // io.emit("roomJoin", new ErrorSend(500, "Some Error occured", []));
      emitError("roomJoin", error, socket);
      console.log({ error });
    }
  });

  // send message
  socket.on("message", async (body) => {
    try {
      if (typeof body !== "object") body = JSON.parse(body);
      const { senderId, roomId, roomType, message, type } = body;

      const chat = await chatsModel.create({
        senderId,
        roomId,
        roomType,
        message,
        type,
      });

      //join room
      const room = String(roomId);
      socket.join(room);
      // emit response
      io.to(room).emit("message", new SuccessSend(200, "message", chat));
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
      const userObjId = new Types.ObjectId(String(userId)),
        pinnedChat = new Types.ObjectId(String(pinChatId));

      let msg = "chat pinned successfully";

      if (type === "pin") {
        // Check how many chats are already pinned for this user
        const pinnedCount = await pinnedChatsModels.countDocuments({
          userId: userObjId,
        });

        if (pinnedCount >= 3) {
          msg = "You can pin up to 3 chats only";
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

  // on disconnect
  socket.on("disconnect", () => {
    console.log(socket.id, "user disconnected");
  });
};
