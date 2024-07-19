import express, { json, urlencoded, static as static_ } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const { PORT } = process.env;

// for socket
const httpServer = createServer(app);
//initializing io
const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: `http://localhost:${PORT}`,
  },
});

// set middlewares
app
  .use(json())
  .use(urlencoded({ extended: true }))
  .use(static_("public"))
  .use(cookieParser())
  .use(logger("dev"));

// import routes
import auth from "./routes/auth.js";
// use routes
app.use("/api/v1/auth", auth);

//error handler middleware
import errorHandler from "#middlewares/errorHandler";
app.use(errorHandler);

// socket handlers
import { userHandler } from "./controllers/sockets/index.js";
const onConnection = (socket) => {
  console.log(socket.id, "connected");
  userHandler(io, socket);

  socket.on("disconnect", () => {
    console.log(socket.id, "user disconnected");
  });
};

io.on("connection", onConnection);

// io.on("connection", (socket) => {
//   // basic
//   console.log(socket.id, "connected");
//   socket.on("test", (data) => {
//     io.emit("test", `hello ${data.name}`);
//   });
// });

// export { app };
export { httpServer };
