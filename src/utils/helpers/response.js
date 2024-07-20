const sendResponse = async (res, success, data, message, statusCode) => {
  const result = { success, data, message };
  return res.status(statusCode).json(result);
};

class SuccessSend {
  constructor(statusCode, message = "Success", data = []) {
    this.success = statusCode < 400; // true
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

class ErrorSend {
  constructor(statusCode, message = "False", data = []) {
    this.success = statusCode < 400; // false
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { sendResponse, SuccessSend, ErrorSend };
