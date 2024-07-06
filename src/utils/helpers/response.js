const sendResponse = async (res, success, data, message, statusCode) => {
  const result = { success, data, message };
  return res.status(statusCode).json(result);
};

class successResponse {
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

class ErrorResponse {
  constructor(statusCode, message = "False", data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export { sendResponse, successResponse, ErrorResponse };
