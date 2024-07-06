import logger from "#helpers/logger";
import { ErrorResponse } from "#helpers/response";

// Error handling middleware function
const errorHandler = (err, req, res, next) => {
  console.log({ err });
  //make entry in logger file
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  res
    .status(err.status || 500)
    .json(
      new ErrorResponse(
        err.status || 500,
        err.message || "Internal Server Error",
        []
      )
    );
};

export default errorHandler;
