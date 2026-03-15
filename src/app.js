import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { createServer } from "http";
import { createServer as createSecureServer } from "https";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimiter from "#middlewares/rateLimiter";
import cluster from "cluster";
import { createAdapter } from "@socket.io/cluster-adapter";
import { setupWorker } from "@socket.io/sticky";
import authRoutes from "./routes/route.js";
import errorHandler from "#middlewares/errorHandler";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const { PORT, ENVIRONMENT } = process.env;

// Choose HTTP or HTTPS server based on ENVIRONMENT
let httpServer = createServer(app);
app.use(
  cors({
    origin: "http://localhost:5173", // or "*" for all origins (not recommended in prod)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

if (ENVIRONMENT === "production") {
  // Load SSL certificate and key
  const options = {
    key: fs.readFileSync(path.resolve("path/to/ssl/key.pem")),
    cert: fs.readFileSync(path.resolve("path/to/ssl/cert.pem")),
  };

  httpServer = createSecureServer(options, app);
  console.warn("Using HTTPS server for production.");
}
//initializing io
const allowedOrigins = [
  `http${ENVIRONMENT === "production" ? "s" : ""}://localhost:${PORT}`, // Handle HTTP or HTTPS origin
  `http://localhost:5173`,
];
// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"], // Specify allowed HTTP methods
  },
});


// Store io in app locals to access in controllers
if (!cluster.isPrimary) {
  io.adapter(createAdapter());
  setupWorker(io);
}

app.locals.io = io;
// use case
// const io = req.app.locals.io;  // Get io instance from app.locals
// io.emit("eventName", { message });

// set middlewares
app
  .use(helmet()) // security headers
  .use(compression()) // compress all responses
  .use(express.json({ limit: "10mb" })) // to convert the body data in JSON
  .use(express.urlencoded({ extended: true, limit: "10mb" })) // to encode url data
  .use(express.static("public")) // set public as static folder for assets
  .use(cookieParser()) // to use cookies
  .use(logger("dev")) // logger in console
  .use(rateLimiter({ time: 1, limit: 100 })); // rate limiter

// emergency
app.get("/boom", (req, res) => {
  process.exit(1);
});

// use routes
app.use("/api/v1", authRoutes);

//health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// frontend host configs
app.use(express.static(path.join(__dirname, "../frontend")))
// .get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend", "index.html"));
// });
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
//error handler middleware
app.use(errorHandler);

// socket handlers
import { userHandler } from "./controllers/sockets/chatModule.js";
const onConnection = async (socket) => {
  const clientIP = socket.handshake;
  // console.log(clientIP, "connected");
  // console.log(socket.id, "connected", socket.client.id, "the client id");
  await userHandler(io, socket);
};

io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;
  // if (!allowedOrigins.includes(origin))
  // return next(new Error("Origin not allowed"));
  next(); // Allow connection if all checks pass
});

io.on("connection", onConnection);
export { httpServer };
