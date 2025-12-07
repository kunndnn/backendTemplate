import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnection.js";
import User from "./User.models.js";
const UserHobby = sequelize.define("UserHobby", {
  hobby_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    // 👈 explicit foreign key definition
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

User.hasMany(UserHobby, { foreignKey: "userId" });
UserHobby.belongsTo(User, { foreignKey: "userId" });

export default UserHobby;
