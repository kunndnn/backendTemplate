class SuccessSend {
  constructor(statusCode, message = "Success", data = null) {
    this.success = statusCode < 400; // true
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

class ErrorSend extends Error {
  constructor(statusCode, message = "False", data = null) {
    super(message); // Call the parent class constructor (Error) to set the message
    this.success = statusCode < 400; // false if status code >= 400
    this.statusCode = statusCode;
    this.message = message; // Make sure message is assigned
    this.data = data;
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message, // Include the message in the JSON output
      data: this.data,
    };
  }
}

module.exports = { SuccessSend, ErrorSend };
