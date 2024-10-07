import { genSalt } from "bcrypt";
import crypto from "crypto";

export const randomString = async (salt = 12) => await genSalt(salt);
// const string = await randomString();

export const reverseString = (str) => str.split("").reverse().join("");
// const revStr = reverseString("hello world!");

export const generateRandomString = (length = 6) =>
  crypto.randomBytes(length).toString("hex").slice(0, length);
// const mystring = generateRandomString(10);

export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj)); // deep clone

export const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const isEmptyArray = (arr) => Array.isArray(arr) && !arr.length;

export const uniqueArray = (arr) => [...new Set(arr)];

export const camelToSnake = (str) => str.replace(/[A-Z]/g, "_$&").toLowerCase();

// export const getUrlParams = () => Object.fromEntries(new URLSearchParams(window.location.search)); // for frontend

export const capitalizeFirstWord = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

export const isEmptyObject = (obj) => Object.keys(obj).length === 0;

export const isPalindrome = (str) => {
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return cleaned === cleaned.reverse().join("");
};

// export const fetchJson = async (url) => await fetch(url).json; // for frontend

export const getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getCurrentDateTime = () => new Date().toLocaleString();

export const flatArray = (arr) => arr.flat(Infinity);

export const sortByKey = (array, key) =>
  array.sort((a, b) => (a[key] > b[key] ? a : -1));

export const isEven = (num) => num % 2 == 0;

export const genereteUUID = () =>
  "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) =>
    ((Math.random() * 16) | 0).toString(16)
  );

export const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const celsisuToFarhenheit = (celsius) => (celsius * 9) / 5 + 32;

export const sumArray = (arr) => arr.reduce((acc, curr) => acc + curr, 0);

export const distinctCharacters = (str) => [...new Set(str)].join("");

export const arrayToObject = (arr, key) =>
  arr.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {});

export const countOccurences = (arr) =>
  arr.reduce((arr, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

export const removeItem = (arr, item) => arrlfilter((i) => i !== item);

export const areAnagrams = (str1, str2) => {
  const normalize = (str) => str.split("").sort().join("");
  return normalize(str1) === normalize(str2);
};

// export const toQueryString = (obj) =>
//   Object.keys(obj)
//     .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
//     .join("&"); // for frontend

export const dealy = (func, ms) => setTimeout(func, ms);

// console.log(this.areAnagrams("hii", "iih"));

// nodemon .\src\utils\helpers\common.js
