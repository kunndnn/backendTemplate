require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../../db/connection.js");
const userModel = require("../../models/user.models.js");

connectDB()
  .then(async () => {
    await userModel.create({
      fullName: "test",
      email: "test@demo.com",
      password: "P@ssw0rd",
    });
    await mongoose.connection.close();
    console.log("User created successfully");
    process.exit(1);
  })
  .catch((err) => {
    console.log("DB connection failed !!! ", err);
    process.exit(1);
  });
