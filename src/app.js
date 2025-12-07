import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import routes from "./routes/auth.routes.js";
import limiter from "./middlewares/rateLimiter.js";
const app = express();
import i18n from "./config/localization.js";

// recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(express.static(join(__dirname, "../public")));

app.use(limiter({ minutes: 1, limit: 20 }));
app.use(i18n.init);

app.use("/api/auth", routes);

export default app;
