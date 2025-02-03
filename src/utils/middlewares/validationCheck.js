import { validationResult } from "express-validator";
import { ErrorSend } from "#helpers/response";
const validationCheck = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty())
    return res.status(500).json(new ErrorSend(500, result.array()[0].msg, []));
  next();
};

//joi validations middleware
const validateCheck = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error)
    return res
      .status(400)
      .json(new ErrorSend(400, error.details[0].message, []));

  const { error: queryError } = schema.validate(req.query, {
    abortEarly: false,
  });
  if (queryError)
    return res
      .status(400)
      .json(new ErrorSend(400, queryError.details[0].message, []));

  next(); // Proceed if validation passes
};

export { validationCheck, validateCheck };
