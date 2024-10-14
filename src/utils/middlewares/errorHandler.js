const logger = require("../helpers/logger");
const { ErrorSend } = require("../helpers/response");
const mongoose = require("mongoose");
const { existsSync, unlinkSync } = require("fs");
const path = require("path");

module.exports = (err, req, res, next) => {
  // Set default error status and message
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

  // Check if the error is an instance of ErrorSend
  if (err instanceof ErrorSend) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Mongoose validation errors
  else if (err instanceof mongoose.Error.ValidationError) {
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
  // Handle validation errors
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }
  // Handle syntax errors
  else if (err.name === "SyntaxError") {
    statusCode = 400;
    message = "Invalid JSON payload";
  }
  // Handle unauthorized errors
  else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Invalid token";
  }
  // Use the default message and status for unhandled errors
  else {
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
  res.status(statusCode).json(new ErrorSend(statusCode, message, null));
};
