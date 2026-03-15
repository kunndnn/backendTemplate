import logger from "#config/logger";
import { ErrorSend } from "#helpers/response";
import deleteFile from "#services/deleteFile";
import mongoose from "mongoose";
import path from "path";
import httpStatus from "http-status";

export default (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || httpStatus[statusCode];

  // Cleanup uploaded files on error
  if (req?.file) {
    deleteFile(path.resolve(req.file.path));
  }
  if (req?.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.forEach((file) => deleteFile(path.resolve(file.path)));
  }

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.code === 11000) {
    statusCode = httpStatus.CONFLICT;
    const field = Object.keys(err.keyValue);
    message = `Duplicate key error: ${field} already exists.`;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}.`;
  } else if (err.name === "SyntaxError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid JSON payload";
  } else if (err.name === "UnauthorizedError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token";
  }

  // Log error
  console.error({ err });
  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Final response format
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data: null,
    ...(process.env.ENVIRONMENT === "development" && { stack: err.stack }),
  });
};
