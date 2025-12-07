import UserModel from "../models/User.models.js";
import UserHobby from "../models/UserHobby.models.js";

export const register = async (req, res) => {
  try {
    const {
      name = "test",
      email = "test@gmail.com",
      hobbies = ["singing", "playing"],
    } = req.query;

    const user = await UserModel.create(
      {
        name,
        email,
        UserHobbies: hobbies.map((hobby) => ({ hobby_name: hobby })),
      },
      {
        include: [UserHobby], // 👈 include association
      },
    );

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUsers = async (req, res) => {
  try {
    // Fetch all users with their related hobbies
    const users = await UserModel.findAll({
      include: [
        {
          model: UserHobby,
          attributes: ["hobby_name"], // only get hobby_name column
        },
      ],
      attributes: ["id", "name", "email"], // only return these user fields
    });

    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
