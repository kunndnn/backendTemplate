import "dotenv/config";
import { connectDB } from "./db/index.js";
import { httpServer } from "./app.js";
const { PORT } = process.env || 3001;

connectDB()
  .then(() => {
    // app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
    httpServer.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.log("DB connection failed !!! ", err);
  });
