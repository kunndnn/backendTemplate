import { promiseHandler } from "#helpers/promiseHandler";
import { ErrorSend, SuccessSend } from "#helpers/response";
import userModel from "#models/user.models";
import { generateTokens } from "#services/dbQueries";

export const login = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await userModel.findOne({ email }).select("+password").lean();
  if (!admin) throw new ErrorSend(403, "User not found");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ErrorSend(401, "Invalid credentials", []);
  const [{ accessToken, refreshToken }, loggedInUser] = await Promise.all([
    generateTokens(user._id),
    userModel.findById(user._id).select("-password -refreshToken").lean(),
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

export const sendOTP = promiseHandler(async (req, res) => {
  const { email } = req.body;
});
export const verifyOTP = promiseHandler(async (req, res) => {
  const { email, otp } = req.body;
});
export const resetPassword = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
});
export const profile = promiseHandler(async (req, res) => {
  if (req.method === "GET") {
    // profile get
  } else if (req.method === "GET") {
    // profile set
  } else {
    throw new ErrorSend(405, "Method Not Allowed");
  }
});
export const updatePassword = promiseHandler(async (req, res) => {
  const { password } = req.body;

  res.status(200).json(new SuccessSend(200, "Password updated successfully"));
});
