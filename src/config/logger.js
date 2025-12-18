import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf } = format;
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message}`;
});

// Create logger instance
const logger = createLogger({
  level: "debug", // Capture all levels (error, warn, info, debug)
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../../logs", "logs.log"), // Single file for all logs
    }),
    new transports.Console({
      // Optional: Log to console
      format: combine(timestamp(), logFormat),
    }),
  ],
});

export default logger;
