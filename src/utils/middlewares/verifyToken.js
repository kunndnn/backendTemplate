const jwt = require("jsonwebtoken");
const { ErrorSend } = require("../helpers/response");
const { promiseHandler } = require("../helpers/promiseHandler");
const userModel = require("../../models/user");

exports.verifyToken = promiseHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ErrorSend(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ErrorSend(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json(
        new ErrorSend(
          401,
          error?.message || "Invalid or Expire access token",
          []
        )
      );
    // throw new ErrorSend(401, error?.message || "Invalid access token");
  }
});
