import NotificationSchedule from "#models/notificationSchedule.models";
import { SuccessSend, ErrorSend } from "#helpers/response";
import httpStatus from "http-status";

export const scheduleNotification = async (req, res) => {
  const { title, body, date, time, timezone, targetUsers } = req.body;

  if (!title || !body || !date || !time || !targetUsers) {
    throw new ErrorSend(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const schedule = await NotificationSchedule.create({
    title,
    body,
    date,
    time,
    timezone,
    targetUsers,
  });

  res
    .status(httpStatus.CREATED)
    .json(new SuccessSend(httpStatus.CREATED, "Notification scheduled successfully", schedule));
};

export const getScheduledNotifications = async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  const [total, data] = await Promise.all([
    NotificationSchedule.countDocuments(),
    NotificationSchedule.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  res.status(httpStatus.OK).json(
    new SuccessSend(httpStatus.OK, "Schedules fetched", {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  );
};
