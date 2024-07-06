// logger.js
import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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

export default logger;
