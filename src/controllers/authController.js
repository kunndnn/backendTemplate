import { promiseHandler } from "#helpers/promiseHandler";
import { successResponse, ErrorResponse } from "#helpers/response";
import userModel from "#models/user";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ErrorResponse(
      500,
      "Something went wrong while generating referesh and access token",
      []
    );
  }
};

export const register = promiseHandler(async (req, res) => {
  const profile = req.file.filename;
  req.body.image = profile;
  const user = await userModel.create(req.body);
  const token = user.generateAccessToken();
  res
    .status(200)
    .json(
      new successResponse(200, "User Registered Successfully", { user, token })
    );
});

export const login = promiseHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    // return res.status(403).json(new ErrorResponse(403, "User not found", []));
    throw new ErrorResponse(403, "User not found", []);
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ErrorResponse(401, "Invalid credentials", []);
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new successResponse(200, "User logged In Successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const refreshAccessToken = promiseHandler(async (req, res) => {
  const { refreshToken: userRefreshToken } = req.cookies || req.body;

  if (!userRefreshToken) {
    throw new ErrorResponse(401, "Unauthorized request");
  }

  const decoded = jwt.verify(
    userRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await userModel.findById(decoded?._id);
  if (!user) {
    throw new ErrorResponse(401, "Invalid refresh token");
  }

  if (userRefreshToken !== user?.refreshToken) {
    throw new ErrorResponse(401, "Refrresh token expired");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new successResponse(200, "Token regenerated successfully", {
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
    .status(200)
    .json(new successResponse(200, "User logout Successfully", []));
});

export const profile = promiseHandler(async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .select("-password -refreshToken");
  res
    .status(200)
    .json(new successResponse(200, "User profile fetched successfully", user));
});
