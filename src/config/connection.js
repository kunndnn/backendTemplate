import { connect } from "mongoose";
import { DB_NAME } from "../constants.js";
// import { createConnection } from "mysql";

export const connectDB = async () => {
  try {
    const connectionInstance = await connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.warn(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.warn("MONGODB connectino error", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.warn("MongoDB disconnected successfully");
  } catch (error) {
    console.warn("MongoDB disconnection error", error);
  }
};

//mysql connection
// export const con = createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "testing",
// });

// con.connect(function (err) {
//   if (err) throw err;
// });
// export default connectDB;
// export { connectDB, con };
// export { connectDB, con };
