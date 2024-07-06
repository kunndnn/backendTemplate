// errorHandler.js

// Error handling middleware function
const errorHandler = (err, req, res, next) => {
  // Set the response status code
  res.status(err.status || 500);

  // Respond with JSON containing the error message
  res.json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
};

export default errorHandler;
// module.exports = errorHandler;
