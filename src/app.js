import express, { json, urlencoded, static as static_ } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

const app = express();

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
export { app };
