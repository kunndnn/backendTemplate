import "dotenv/config";
import { connectDB, disconnectDB } from "../../config/connection";

(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.warn("Operation failed ❌", err);
    process.exit(1); // failure
  } finally {
    await disconnectDB();
    process.exit(0); // success
  }
})();
