const { connect } = require("mongoose");
const { DB_NAME } = require("../constants");

exports.connectDB = async () => {
  try {
    const connectionInstance = await connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connectino error", error);
    process.exit(1);
  }
};
