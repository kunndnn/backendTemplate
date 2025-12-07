import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnection.js";
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync(); // auto-create tables if not exist

export default User;
