import fss from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { promises as fs } from "fs"; // Correct import for fs.promises
import { promiseHandler } from "#helpers/promiseHandler";
import { SuccessSend, ErrorSend } from "#helpers/response";
import { generateOtp } from "#helpers/common";
import { sendMailToUser } from "#services/sendMail";
import otpModel from "#models/otp.models";
import userModel from "#models/user.models";
import userDeviceModels from "#models/userDevice.models";
import { generateTokens, users } from "#services/dbQueries";

const { BASE_URL } = process.env;

export const register = promiseHandler(async (req, res) => {
  const userData = req.body;
  if (req.file) {
    const image = `${BASE_URL}/${req?.file?.path?.split("public")[1]}`;
    userData.image = image;
  }
  const deviceData = {
    deviceId: userData.deviceId,
    deviceType: userData.deviceType,
    deviceToken: userData.deviceToken,
  };

  delete userData.deviceId;
  delete userData.deviceType;
  delete userData.deviceToken;

  const user = await userModel.create(userData),
    accessToken = user.generateAccessToken(),
    refreshToken = user.generateRefreshToken();

  await userDeviceModels.create({ ...deviceData, userId: user._id });

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
  const { email, password, deviceId, deviceType, deviceToken } = req.body;
  const user = await userModel.findOne({ email }).select("+password").lean();

  if (!user) throw new ErrorSend(403, "User not found", []);

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(401, "Invalid credentials", []);

  const [{ accessToken, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(user._id),
    userModel.findById(user._id).select("-password -refreshToken").lean(),
  ]);

  // find if device exists or not if not then create and also updated the userid if exists
  await userDeviceModels.findOneAndUpdate(
    { deviceId, deviceType, deviceToken },
    { userId: user._id },
    { upsert: true, new: true }
  );

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

  await userDeviceModels.findOneAndUpdate(
    { deviceId, deviceType, deviceToken },
    { userId: user._id },
    { upsert: true, new: true }
  );

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

export const forgotPassword = promiseHandler(async (req, res) => {
  const { email } = req.body;
  const userExist = await userModel.findOne({ email }).lean();
  if (!userExist) throw "Email does not exist";
  const code = generateOtp();
  await otpModel.create({ email, code });
  await sendMailToUser({
    to: email,
    subject: "Forgot Password OTP!",
    html: "template.ejs",
    templateData: {
      email,
      otp: code,
    },
  });
  res.status(200).json(new SuccessSend(200, "OTP sent to the email"));
});

export const verifyOTP = promiseHandler(async (req, res) => {
  const { email, otp } = req.body;
  const matchOTP = await otpModel
    .findOneAndDelete({ email, code: otp })
    .sort({ createdAt: -1 })
    .lean();
  if (!matchOTP) throw "Invalid or Expired OTP";
  res.status(200).json(new SuccessSend(200, "OTP matched successfully"));
});

export const resetPassword = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) throw "Email not exist";
  user.password = password;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(new SuccessSend(200, "Password reset successfully"));
});

export const refreshAccessToken = promiseHandler(async (req, res) => {
  const { refreshToken: userRefreshToken } = req.cookies || req.body;

  if (!userRefreshToken) throw new ErrorSend(401, "Unauthorized request");

  const decoded = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await userModel.findById(decoded?._id).lean();
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
  const { deviceId, deviceType, deviceToken } = req.body;

  await Promise.all([
    userModel.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    }),
    userDeviceModels.findOneAndDelete({
      deviceId,
      deviceType,
      deviceToken,
    }),
  ]);

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new SuccessSend(200, "User logout Successfully", []));
});

export const profile = promiseHandler(async (req, res) => {
  const userId = String(req.user._id); // Ensure it's converted to string
  if (req.method === "GET") {
    const user = await userModel.findById(userId).lean();
    return res
      .status(200)
      .json(new SuccessSend(200, "User profile fetched successfully", user));
  } else if (req.method === "POST") {
    const userData = req.body;

    const existingUser = await userModel.findById(userId).lean();
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
      .select("-password -createdAt -updatedAt")
      .lean();
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

export const usersListing = promiseHandler(async (req, res) => {
  let { page = 1, limit = 10, search } = req.query;
  const userId = String(req.user._id); // Ensure it's converted to string
  // convert to numbers
  page = parseInt(page);
  limit = parseInt(limit);

  const data = await users({ page, limit, userId, search });

  res.status(200).json(new SuccessSend(200, "Users listing", data));
});
