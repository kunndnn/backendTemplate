const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const path = require("path");
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../../logs", "errors.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
