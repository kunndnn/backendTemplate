import logger from "#helpers/logger";
import { ErrorSend } from "#helpers/response";
import mongoose from "mongoose";

export default (err, req, res, next) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // Check if the error is an instance of ErrorSend
  if (err instanceof ErrorSend) {
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


