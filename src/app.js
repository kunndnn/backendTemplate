const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { join } = require("path");
const app = express();
const { PORT } = process.env;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${PORT}`,
    // origin: "*",
  },
});

app
  .use(express.json()) // to convert the body data in JSON
  .use(express.urlencoded({ extended: false })) // to encode url data
  .use(express.static(join(__dirname, "../public")))// set public as static folder for assets
  .use(logger("dev"))// logger in console
  .use(cookieParser());// to use cookies

// emergency
app.get("/boom", (req, res) => {
  process.exit(1);
});

// user routes
const auth = require("./routes/auth.routes");
app.use("/api/v1/auth", auth);

// error handler middlewares
const errorHandler = require("./utils/middlewares/errorHandler");
app.use(errorHandler);

//socket handlers

const { userHandler } = require("./controllers/sockets/index");
const onConnection = (socket) => {
  console.log(socket.id, "connected", socket.client.id, "the client id");

  userHandler(io, socket);

  socket.on("disconnect", () => {
    console.log(socket.id, "user disconnected");
  });
};

io.on("connection", onConnection);

module.exports = { httpServer };
