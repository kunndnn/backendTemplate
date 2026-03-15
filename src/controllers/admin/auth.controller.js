import { ErrorSend, SuccessSend } from "#helpers/response";
import userModel from "#models/user.models";
import { generateTokens } from "#services/dbQueries";
import path from "path";
import fss from "fs";
import { promises as fs } from "fs";
import httpStatus from "http-status";

const { BASE_URL } = process.env;

export const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await userModel.findOne({ email }).select("+password");
  if (!admin) throw new ErrorSend(httpStatus.FORBIDDEN, "User not found");
  
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(httpStatus.UNAUTHORIZED, "Invalid credentials");
  
  const [{ token, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(admin._id),
    userModel.findById(admin._id).select("-password -refreshToken").lean(),
  ]);

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

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  // TODO: Implement OTP sending
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "OTP sent (Mock)"));
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  // TODO: Implement OTP verification
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "OTP verified (Mock)"));
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  // TODO: Implement password reset
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Password reset (Mock)"));
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

export const profile = async (req, res) => {
  const userId = String(req.user._id);

  if (req.method === "GET") {
    const user = await userModel
      .findById(userId)
      .select("-password -createdAt -updatedAt")
      .lean();

    if (!user) throw new ErrorSend(httpStatus.NOT_FOUND, "User not found");

    return res
      .status(httpStatus.OK)
      .json(new SuccessSend(httpStatus.OK, "User profile fetched successfully", user));
  }

  if (req.method === "POST") {
    const userData = req.body;
    const existingUser = await userModel.findById(userId).lean();
    if (!existingUser) throw new ErrorSend(httpStatus.NOT_FOUND, "User not found");

    if (req.file) {
      const relativePath = req.file.path.replace(/\\/g, "/").replace(/^public\//, "");
      userData.image = `${BASE_URL}/${relativePath}`;

      if (existingUser.image) {
        const oldImagePath = path.join(process.cwd(), "public", existingUser.image.replace(BASE_URL, ""));
        if (fss.existsSync(oldImagePath)) {
          await fs.unlink(oldImagePath);
        }
      }
    }

    const allowedFields = ["fullName", "phone", "image"];
    Object.keys(userData).forEach((key) => {
      if (!allowedFields.includes(key) || userData[key] === "" || userData[key] == null) {
        delete userData[key];
      }
    });

    const user = await userModel
      .findByIdAndUpdate(userId, userData, { new: true })
      .select("-password -createdAt -updatedAt")
      .lean();
      
    return res
      .status(httpStatus.OK)
      .json(new SuccessSend(httpStatus.OK, "Profile updated successfully", user));
  }

  throw new ErrorSend(httpStatus.METHOD_NOT_ALLOWED, "Method Not Allowed");
};

export const updatePassword = async (req, res) => {
  res.status(httpStatus.OK).json(new SuccessSend(httpStatus.OK, "Password updated successfully"));
};
