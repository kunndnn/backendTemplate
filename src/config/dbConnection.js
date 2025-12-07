import { Sequelize } from "sequelize";
const {
  DB_NAME = "test",
  DB_USER = "root",
  DB_PASS = "",
  DB_HOST = "localhost",
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql",
  logging: false, // 👈 disables SQL logs
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL successfully!");
  } catch (error) {
    console.error("❌ Unable to connect:", error);
  }
};

export { connectDB, sequelize };
