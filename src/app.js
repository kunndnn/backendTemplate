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
  .use(json()) // to convert the body data in JSON
  .use(urlencoded({ extended: true })) // to encode url data
  .use(static_("public")) // set public as static folder for assets
  .use(cookieParser()) // to use cookies
  .use(logger("dev")); // logger in console

  // emergency
app.get("/boom", (req, res) => {
  process.exit(1);
});

// import routes
import auth from "./routes/auth.routes.js";
// use routes
app.use("/api/v1/auth", auth);

//error handler middleware
import errorHandler from "#middlewares/errorHandler";
app.use(errorHandler);

// socket handlers
import { userHandler } from "./controllers/sockets/index.js";
const onConnection = (socket) => {
  console.log(socket.id, "connected", socket.client.id, "the client id");

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
