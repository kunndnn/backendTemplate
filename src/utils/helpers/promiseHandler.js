const { ErrorSend } = require("../helpers/response");
exports.promiseHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};
