import logger from "#helpers/logger";
import { ErrorSend } from "#helpers/response";
import mongoose from "mongoose";
import { existsSync, unlinkSync } from "fs";
import path from "path";

export default (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  //delete file function
  const deleteFile = (filePath) => {
    if (existsSync(filePath)) unlinkSync(filePath);
  };

  if (req?.file) {
    // if has single file then delete it
    const filePath = path.resolve(req.file.path);
    deleteFile(filePath);
  }

  // Check if there are multiple files (req.files) and delete them
  if (req?.files) {
    const files = Array.isArray(req.files)
      ? req.files
      : Object.values(req.files).flat();
    files.forEach((file) => {
      const filePath = path.resolve(file.path);
      deleteFile(filePath);
    });
  }

  if (err instanceof ErrorSend) {
    // Check if the error is an instance of ErrorSend
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle other errors (e.g., Mongoose, ValidationError, etc.)
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.code && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue);
    message = `Duplicate key error: ${field} already exists.`;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "SyntaxError") {
    statusCode = 400;
    message = "Invalid JSON payload";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Invalid token";
  } else {
    message = err.message || message;
  }

  // Log the error for debugging
  console.error({ err });
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  // Send the error response including the message
  res.status(statusCode).json({
    success: false,
    statusCode,
    message, // Ensure message is included in the response
    data: [],
  });
};


