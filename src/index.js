import "dotenv/config";
const { PORT = 3000 } = process.env;
import { connectDB } from "../src/config/dbConnection.js";
import app from "./app.js";
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(`error connecting to DB ${err}`);
  });
