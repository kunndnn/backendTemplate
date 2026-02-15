import { promiseHandler } from "#helpers/promiseHandler";
import { ErrorSend, SuccessSend } from "#helpers/response";
import userModel from "#models/user.models";
import { generateTokens } from "#services/dbQueries";
import path from "path";
import fss from "fs";
import { promises as fs } from "fs"; // Correct import for fs.promises

const { BASE_URL } = process.env;

export const login = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await userModel.findOne({ email }).select("+password");
  if (!admin) throw new ErrorSend(403, "User not found");
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(401, "Invalid credentials", []);
  const [{ token, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(admin._id),
    userModel.findById(admin._id).select("-password -refreshToken").lean(),
  ]);
  console.log({ token, refreshToken });
  res
    .status(200)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(200, "User logged In Successfully", {
        user: loggedInUser,
        token,
        refreshToken,
      })
    );
});

export const sendOTP = promiseHandler(async (req, res) => {
  const { email } = req.body;
});

export const verifyOTP = promiseHandler(async (req, res) => {
  const { email, otp } = req.body;
});

export const resetPassword = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
});

export const refreshtoken = promiseHandler(async (req, res) => {
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

  const { token, refreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("token", token)
    .cookie("refreshToken", refreshToken)
    .json(
      new SuccessSend(200, "Token regenerated successfully", {
        token,
        refreshToken,
      })
    );
});

export const profile = promiseHandler(async (req, res) => {
  const userId = String(req.user._id);

  /* =========================
     GET PROFILE
  ========================= */
  if (req.method === "GET") {
    const user = await userModel
      .findById(userId)
      .select("-password -createdAt -updatedAt")
      .lean();

    if (!user) throw new ErrorSend(404, "User not found");

    return res
      .status(200)
      .json(new SuccessSend(200, "User profile fetched successfully", user));
  }

  /* =========================
     UPDATE PROFILE
  ========================= */
  if (req.method === "POST") {
    const userData = req.body; // ✅ kept as requested
    const { fullName } = req.body;

    const existingUser = await userModel.findById(userId).lean();
    if (!existingUser) throw new ErrorSend(404, "User not found");
    /* ---------- IMAGE UPLOAD ---------- */
    if (req.file) {
      const relativePath = req.file.path
        .replace(/\\/g, "/")
        .replace(/^public\//, "");

      userData.image = `${BASE_URL}/${relativePath}`;

      // delete old image if exists
      if (existingUser.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingUser.image.replace(BASE_URL, "")
        );

        if (fss.existsSync(oldImagePath)) {
          await fs.unlink(oldImagePath);
        }
      }
    }

    /* ---------- WHITELIST FIELDS ---------- */
    const allowedFields = ["fullName", "phone", "image"];

    Object.keys(userData).forEach((key) => {
      if (
        !allowedFields.includes(key) ||
        userData[key] === "" ||
        userData[key] == null
      ) {
        delete userData[key];
      }
    });

    /* ---------- UPDATE USER ---------- */
    const user = await userModel
      .findByIdAndUpdate(userId, userData, { new: true })
      .select("-password -createdAt -updatedAt")
      .lean();
    return res
      .status(200)
      .json(new SuccessSend(200, "Profile updated successfully", user));
  }

  /* =========================
     METHOD NOT ALLOWED
  ========================= */
  throw new ErrorSend(405, "Method Not Allowed");
});

export const updatePassword = promiseHandler(async (req, res) => {
  const { password } = req.body;

  res.status(200).json(new SuccessSend(200, "Password updated successfully"));
});
