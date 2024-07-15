import { validationResult } from "express-validator";
import { ErrorSend } from "#helpers/response";
const validationCheck = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res
      .status(500)
      .json(new ErrorSend(500, result.array()[0].msg, []));
  }
  next();
};

export { validationCheck };
