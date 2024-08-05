class SuccessSend {
  constructor(statusCode, message = "Success", data = []) {
    this.success = statusCode < 400; // true
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

class ErrorSend {
  constructor(statusCode, message = "False", data = null) {
    this.success = statusCode < 400; // false
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

module.exports = { SuccessSend, ErrorSend };
