import Notification from "#models/notification.models";
import { SuccessSend, ErrorSend } from "#helpers/response";
import httpStatus from "http-status";

export const getNotifications = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const [total, data] = await Promise.all([
    Notification.countDocuments({ userId: req.user._id }),
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  res.status(httpStatus.OK).json(
    new SuccessSend(httpStatus.OK, "Notifications fetched", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  );
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new ErrorSend(httpStatus.NOT_FOUND, "Notification not found");

  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Notification marked as read", notification));
};

export const deleteNotification = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndDelete({ _id: id, userId: req.user._id });

  if (!notification) throw new ErrorSend(httpStatus.NOT_FOUND, "Notification not found");

  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Notification deleted", []));
};
