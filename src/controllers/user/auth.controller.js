import fss from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { promises as fs } from "fs";
import { SuccessSend, ErrorSend } from "#helpers/response";
import { generateOtp } from "#helpers/common";
import { sendMailToUser } from "#services/sendMail";
import otpModel from "#models/otp.models";
import userModel from "#models/user.models";
import userDeviceModels from "#models/userDevice.models";
import { generateTokens, users } from "#services/dbQueries";
import httpStatus from "http-status";

const { BASE_URL } = process.env;

export const register = async (req, res) => {
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

  const user = await userModel.create(userData);
  const token = user.generatetoken();
  const refreshToken = user.generateRefreshToken();

  await userDeviceModels.create({ ...deviceData, userId: user._id });

  res
    .status(httpStatus.CREATED)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(httpStatus.CREATED, "User Registered Successfully", {
        user,
        token,
        refreshToken,
      })
    );
};

export const login = async (req, res) => {
  const { email, password, deviceId, deviceType, deviceToken } = req.body;
  const user = await userModel.findOne({ email }).select("+password").lean();

  if (!user) throw new ErrorSend(httpStatus.FORBIDDEN, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(httpStatus.UNAUTHORIZED, "Invalid credentials");

  const [{ token, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(user._id),
    userModel.findById(user._id).select("-password -refreshToken").lean(),
  ]);

  await userDeviceModels.findOneAndUpdate(
    { deviceId, deviceType, deviceToken },
    { userId: user._id },
    { upsert: true, new: true }
  );

  res
    .status(httpStatus.OK)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(httpStatus.OK, "User logged In Successfully", {
        user: loggedInUser,
        token,
        refreshToken,
      })
    );
};

export const socialLogin = async (req, res) => {
  const userData = req.body;
  const { email, socialId, socialType, image, deviceId, deviceType, deviceToken } = userData;
  const userExist = await userModel.findOne({ email });
  let token, refreshToken, user;

  if (userExist) {
    const tokens = await generateTokens(userExist._id);
    token = tokens.token;
    refreshToken = tokens.refreshToken;

    userExist.socialId = socialId;
    userExist.socialType = socialType;
    if (image) userExist.image = image;
    await userExist.save();
    user = userExist;
  } else {
    userData.password = socialId;
    const userCreate = await userModel.create(userData);
    token = userCreate.generatetoken();
    refreshToken = userCreate.generateRefreshToken();
    user = userCreate;
  }

  await userDeviceModels.findOneAndUpdate(
    { deviceId, deviceType, deviceToken },
    { userId: user._id },
    { upsert: true, new: true }
  );

  res
    .status(httpStatus.OK)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(httpStatus.CREATED, "User Login Successfully", {
        user,
        token,
        refreshToken,
      })
    );
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const userExist = await userModel.findOne({ email }).lean();
  if (!userExist) throw new ErrorSend(httpStatus.BAD_REQUEST, "Email does not exist");
  
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
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "OTP sent to the email"));
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const matchOTP = await otpModel
    .findOneAndDelete({ email, code: otp })
    .sort({ createdAt: -1 })
    .lean();
  if (!matchOTP) throw new ErrorSend(httpStatus.BAD_REQUEST, "Invalid or Expired OTP");
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "OTP matched successfully"));
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) throw new ErrorSend(httpStatus.BAD_REQUEST, "Email not exist");
  user.password = password;
  await user.save({ validateBeforeSave: false });
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Password reset successfully"));
};

export const refreshtoken = async (req, res) => {
  const { refreshToken: userRefreshToken } = req.cookies || req.body;

  if (!userRefreshToken) throw new ErrorSend(httpStatus.UNAUTHORIZED, "Unauthorized request");

  const decoded = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await userModel.findById(decoded?._id).lean();
  if (!user) throw new ErrorSend(httpStatus.UNAUTHORIZED, "Invalid refresh token");

  if (userRefreshToken !== user?.refreshToken)
    throw new ErrorSend(httpStatus.UNAUTHORIZED, "Refresh token expired");

  const { token, refreshToken } = await generateTokens(user._id);

  res
    .status(httpStatus.OK)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(httpStatus.OK, "Token regenerated successfully", {
        token,
        refreshToken,
      })
    );
};

export const logout = async (req, res) => {
  const { deviceId, deviceType, deviceToken } = req.body;

  await Promise.all([
    userModel.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: 1,
      },
    }),
    userDeviceModels.findOneAndDelete({
      deviceId,
      deviceType,
      deviceToken,
    }),
  ]);

  res
    .clearCookie("token")
    .clearCookie("refreshToken")
    .status(httpStatus.OK)
    .json(new SuccessSend(httpStatus.OK, "User logout Successfully", []));
};

export const profile = async (req, res) => {
  const userId = String(req.user._id);
  if (req.method === "GET") {
    const user = await userModel.findById(userId).lean();
    return res
      .status(httpStatus.OK)
      .json(new SuccessSend(httpStatus.OK, "User profile fetched successfully", user));
  } else if (req.method === "POST") {
    const userData = req.body;

    const existingUser = await userModel.findById(userId).lean();
    if (!existingUser) throw new ErrorSend(httpStatus.NOT_FOUND, "User not found");

    if (req.file) {
      const image = `${BASE_URL}/${req?.file?.path?.split("public")[1]}`;
      userData.image = image;
      if (existingUser.image) {
        const oldImagePath = path.join(process.cwd(), "public/", existingUser?.image?.split(BASE_URL)[1]);
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
      .status(httpStatus.OK)
      .json(new SuccessSend(httpStatus.OK, "Profile updated successfully", user));
  } else {
    throw new ErrorSend(httpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed");
  }
};

export const changePass = async (req, res) => {
  const { password, newPassword } = req.body;

  const user = await userModel.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) throw new ErrorSend(httpStatus.UNPROCESSABLE_ENTITY, "Old password incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  res
    .status(httpStatus.OK)
    .json(new SuccessSend(httpStatus.OK, "Password updated successfully", []));
};

export const usersListing = async (req, res) => {
  let { page = 1, limit = 10, search } = req.query;
  const userId = String(req.user._id);
  page = parseInt(page);
  limit = parseInt(limit);

  const data = await users({ page, limit, userId, search });

  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Users listing", data));
};
