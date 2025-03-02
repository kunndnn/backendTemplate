import { validationResult } from "express-validator";
import { ErrorSend } from "#helpers/response";
const validationCheck = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(500).json(new ErrorSend(500, result.array()[0].msg, []));
  next();
};

//joi validations middleware
const validateCheck = (req, res, next) => {
  if (req?.validations) {
    const result = req.validations.validate(req.body);
    if (result && result.error)
      throw new ErrorSend(400, result.error.details[0].message);
  }
  next();
};

export { validationCheck, validateCheck };
