const { validationResult } = require("express-validator");
const { ErrorSend } = require("../helpers/response");

const validationCheck = async (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(500).json(new ErrorSend(500, result.array()[0].msg));
  }
  next();
};

module.exports = { validationCheck };
