import logger from "#helpers/logger";
import { ErrorResponse } from "#helpers/response";
import mongoose from "mongoose";

export default (err, req, res, next) => {
  // Set default error status and message
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }
  // Handle Mongoose duplicate key errors
  else if (err.code && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue);
    message = `Duplicate key error: ${field} already exists.`;
  }
  // Handle Mongoose cast errors (invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
  }
  // Handle other errors (including runtime errors)
  else if (err.name === "ValidationError") {
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
  // Send the error response

  res.status(statusCode).json(new ErrorResponse(statusCode, message, []));
};
