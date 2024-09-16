const { promiseHandler } = require("../utils/helpers/promiseHandler");
const { SuccessSend, ErrorSend } = require("../utils/helpers/response");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const userModel = require("../models/user.models");
const { bufferToImage } = require("../utils/helpers/bufferToFile");
const { isNullOrUndefined } = require("util");

const generateTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId),
      accessToken = user.generateAccessToken(),
      refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ErrorSend(
      500,
      "Something went wrong while generating referesh and access token",
      null
    );
  }
};

exports.register = promiseHandler(async (req, res) => {
  const userData = req.body;
  if (req.file) {
    userData.image = req.file.filename;
  }
  const user = await userModel.create(userData),
    accessToken = user.generateAccessToken(),
    refreshToken = user.generateRefreshToken();

  res
    .status(201)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(201, "User Registered Successfully", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

exports.login = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ErrorSend(403, "User not found", null);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ErrorSend(401, "Invalid credentials", null);
  }

  const [{ accessToken, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(user._id),
    userModel.findById(user._id).select("-password -refreshToken"),
  ]);

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(200, "User logged In Successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

exports.refreshAccessToken = promiseHandler(async (req, res) => {
  const { refreshToken: userRefreshToken } = req.cookies || req.body;

  if (!userRefreshToken) {
    throw new ErrorSend(401, "Unauthorized request");
  }

  const decoded = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await userModel.findById(decoded?._id);
  if (!user) {
    throw new ErrorSend(401, "Invalid refresh token");
  }

  if (userRefreshToken !== user?.refreshToken) {
    throw new ErrorSend(401, "Refrresh token expired");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(200, "Token regenerated successfully", {
        accessToken,
        refreshToken,
      })
    );
});

exports.logout = promiseHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, // this removes the field from document
    },
  });

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new SuccessSend(200, "User logout Successfully", null));
});

exports.profile = promiseHandler(async (req, res) => {
  // const user = await userModel
  //   .findById(req.user._id)
  //   .select("-password -refreshToken");
  const userId = String(req.user._id); // Ensure it's converted to string
  const user = await userModel.aggregate([
    { $match: { _id: new Types.ObjectId(userId) } },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        image: { $ifNull: ["$image", ""] },
        imagePath: `${req.protocol}://${req.get("host")}/temp/`,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  res
    .status(200)
    .json(new SuccessSend(200, "User profile fetched successfully", user));
});

exports.profileUpdate = promiseHandler(async (req, res) => {
  const userData = req.body;

  const existingUser = await userModel.findById(req.user._id);
  if (!existingUser) {
    return res.status(404).json(new ErrorSend(404, "User not found"));
  }

  if (req.file) {
    userData.image = req.file.filename;
    // If the existing user has an image, delete the old image file
    if (existingUser.image) {
      // const oldImagePath = path.join(__dirname,"../../public/temp",existingUser.image);
      const oldImagePath = path.join(
        process.cwd(),
        "public/temp",
        existingUser.image
      );
      await fs.unlink(oldImagePath);
    }
  } else {
    userData.image = existingUser.image;
  }

  const user = await userModel
    .findByIdAndUpdate(req.user._id, userData, {
      new: true,
    })
    .select("-password -createdAt -updatedAt");
  res
    .status(200)
    .json(new SuccessSend(200, "Profile updated successfully", user));
});

exports.changePass = promiseHandler(async (req, res) => {
  const { password, newPassword } = req.body;

  const user = await userModel.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect)
    return res.status(422).json(new ErrorSend(422, "Old password Incorrect"));

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new SuccessSend(200, "Password updated successfully", null));
});
