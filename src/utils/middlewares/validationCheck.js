import { validationResult } from "express-validator";
import { ErrorResponse } from "#helpers/response";
const validationCheck = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res
      .status(500)
      .json(new ErrorResponse(500, result.array()[0].msg, []));
  }
  next();
};

export { validationCheck };
