import { promiseHandler } from "#helpers/promiseHandler";
import { SuccessSend, ErrorSend } from "#helpers/response";
import userModel from "#models/user.models";
import jwt from "jsonwebtoken";
import { promises as fs } from "fs"; // Correct import for fs.promises
import fss from "fs";
import path from "path";
const { BASE_URL } = process.env;
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
      []
    );
  }
};

export const register = promiseHandler(async (req, res) => {
  const userData = req.body;
  if (req.file) {
    const image = `${BASE_URL}/${req?.file?.path?.split("public")[1]}`;
    userData.image = image;
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

export const login = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) throw new ErrorSend(403, "User not found", []);

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(401, "Invalid credentials", []);

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

export const socialLogin = promiseHandler(async (req, res) => {
  const userData = req.body;
  const { email, socialId, socialType, image } = userData;
  const userExist = await userModel.findOne({ email });
  let accessToken, refreshToken, user;

  if (userExist) {
    const tokens = await generateTokens(userExist._id);
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;

    //update the data
    userExist.socialId = socialId;
    userExist.socialType = socialType;
    if (image) userExist.image = image;
    userExist.save();
    user = userExist;
  } else {
    userData.password = socialId;
    const userCreate = await userModel.create(userData).select("fullName");
    accessToken = userCreate.generateAccessToken();
    refreshToken = userCreate.generateRefreshToken();
    user = userCreate;
  }

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(201, "User Login Successfully", {
        user,
        accessToken,
        refreshToken,
      })
    );
});

export const refreshAccessToken = promiseHandler(async (req, res) => {
  const { refreshToken: userRefreshToken } = req.cookies || req.body;

  if (!userRefreshToken) throw new ErrorSend(401, "Unauthorized request");

  const decoded = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await userModel.findById(decoded?._id);
  if (!user) throw new ErrorSend(401, "Invalid refresh token");

  if (userRefreshToken !== user?.refreshToken)
    throw new ErrorSend(401, "Refrresh token expired");

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

export const logout = promiseHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, // this removes the field from document
    },
  });

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new SuccessSend(200, "User logout Successfully", []));
});

export const profile = promiseHandler(async (req, res) => {
  const userId = String(req.user._id); // Ensure it's converted to string
  if (req.method === "GET") {
    const user = await userModel.findById(userId);
    // const user = await userModel.aggregate([
    //   { $match: { _id: new Types.ObjectId(userId) } },
    //   {
    //     $project: {
    //       _id: 1,
    //       fullName: 1,
    //       email: 1,
    //       image: 1,
    //       createdAt: 1,
    //       updatedAt: 1,
    //     },
    //   },
    // ]);
    return res
      .status(200)
      .json(new SuccessSend(200, "User profile fetched successfully", user));
  } else if (req.method === "POST") {
    const userData = req.body;

    const existingUser = await userModel.findById(userId);
    if (!existingUser) throw new ErrorSend(404, "User not found", []);

    if (req.file) {
      const image = `${BASE_URL}/${req?.file?.path?.split("public")[1]}`;

      userData.image = image;
      // If the existing user has an image, delete the old image file
      if (existingUser.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "public/",
          existingUser?.image?.split(BASE_URL)[1]
        );

        if (fss.existsSync(oldImagePath)) await fs.unlink(oldImagePath);
      }
    } else {
      userData.image = existingUser.image;
    }

    const user = await userModel
      .findByIdAndUpdate(req.user._id, userData, {
        new: true,
      })
      .select("-password -createdAt -updatedAt");
    return res
      .status(200)
      .json(new SuccessSend(200, "Profile updated successfully", user));
  } else {
    throw new ErrorSend(405, "Method Not Allowed");
  }
});

export const changePass = promiseHandler(async (req, res) => {
  const { password, newPassword } = req.body;

  const user = await userModel.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) throw new ErrorSend(422, "Old password incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new SuccessSend(200, "Password updated successfully", []));
});
