import { verify } from "jsonwebtoken";
import { ErrorResponse } from "#helpers/response";
import { promiseHandler } from "#helpers/promiseHandler";
import userModel from "#models/user";

export const verifyToken = promiseHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log(token);
    if (!token) {
      throw new ErrorResponse(401, "Unauthorized request");
    }

    const decodedToken = verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken");

    if (!user) {
      throw new ErrorResponse(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ErrorResponse(401, error?.message || "Invalid access token");
  }
});
