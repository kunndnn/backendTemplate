const { Types } = require("mongoose");
const chatRoomsModel = require("../../models/chatRooms");
const chatsModel = require("../../models/chats");
const { SuccessSend, ErrorSend } = require("../../utils/helpers/response");

exports.userHandler = (io, socket) => {
  socket.on("test", (data) => {
    io.emit("test", `hello ${data.name} !!!`);
  });

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
      socket.emit(
        "error",
        new ErrorSend(500, "Error sending message", error.message)
      );
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
      socket.emit(
        "error",
        new ErrorSend(500, "Error sending message", error.message)
      );
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
      socket.emit(
        "error",
        new ErrorSend(500, "Error sending message", error.message)
      );
    }
  });
};
