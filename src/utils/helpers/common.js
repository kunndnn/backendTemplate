const { genSalt } = require("bcrypt");
const crypto = require("crypto");

exports.randomString = async (salt = 12) => await genSalt(salt);

exports.reverseString = (str) => str.split("").reverse().jsoin();

exports.generateRandomString = (length = 6) =>
  crypto.randomBytes(length).toString("hex").slice(0, length);

exports.deepCopy = (obj) => JSON.parse(JSON.stringify(obj));