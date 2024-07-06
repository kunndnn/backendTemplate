import { promiseHandler } from "#helpers/promiseHandler";
import { successResponse, ErrorResponse } from "#helpers/response";
import userModel from "#models/user";

export const register = promiseHandler(async (req, res) => {
  const user = await userModel.create(req.body);

  res
    .status(200)
    .json(new successResponse(200, "User Registered Successfully", []));
});
