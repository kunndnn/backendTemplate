import jwt from "jsonwebtoken";
import { ErrorResponse } from "#helpers/response";
import { promiseHandler } from "#helpers/promiseHandler";
import userModel from "#models/user";

export const verifyToken = promiseHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
      // console.log("inside the token");
      throw new ErrorResponse(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ErrorResponse(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json(
        new ErrorResponse(
          401,
          error?.message || "Invalid or Expire access token",
          []
        )
      );
    // throw new ErrorResponse(401, error?.message || "Invalid access token");
  }
});
