import { genSalt } from "bcrypt";
import crypto from "crypto";

export const randomString = async (salt = 12) => await genSalt(salt);
// const string = await randomString();

export const reverseString = (str) => str.split("").reverse().join("");
// const revStr = reverseString("hello world!");

export const generateRandomString = (length = 6) =>
  crypto.randomBytes(length).toString("hex").slice(0, length);
// const mystring = generateRandomString(10);
// nodemon .\src\utils\helpers\common.js