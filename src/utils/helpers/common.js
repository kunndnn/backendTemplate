const { genSalt } = require("bcrypt");
const crypto = require("crypto");

exports.randomString = async (salt = 12) => await genSalt(salt);

exports.reverseString = (str) => str.split("").reverse().jsoin();

exports.generateRandomString = (length = 6) =>
  crypto.randomBytes(length).toString("hex").slice(0, length);

exports.deepCopy = (obj) => JSON.parse(JSON.stringify(obj)); // deep clone

exports.randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

exports.isEmptyArray = (arr) => Array.isArray(arr) && !arr.length;

exports.uniqueArray = (arr) => [...new Set(arr)];

exports.camelToSnake = (str) => str.replace(/[A-Z]/g, "_$&").toLowerCase();

// exports.getUrlParams = () => Object.fromEntries(new URLSearchParams(window.location.search)); // for frontend

exports.capitalizeFirstWord = (str) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase());

exports.isEmptyObject = (obj) => Object.keys(obj).length === 0;

exports.isPalindrome = (str) => {
  const cleaned = str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return cleaned === cleaned.reverse().join("");
};

// exports.fetchJson = async (url) => await fetch(url).json; // for frontend

exports.getRandomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;

exports.toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

exports.getCurrentDateTime = () => new Date().toLocaleString();

exports.flatArray = (arr) => arr.flat(Infinity);

exports.sortByKey = (array, key) =>
  array.sort((a, b) => (a[key] > b[key] ? a : -1));

exports.isEven = (num) => num % 2 == 0;

exports.genereteUUID = () =>
  "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) =>
    ((Math.random() * 16) | 0).toString(16)
  );

exports.getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

exports.celsisuToFarhenheit = (celsius) => (celsius * 9) / 5 + 32;

exports.sumArray = (arr) => arr.reduce((acc, curr) => acc + curr, 0);

exports.distinctCharacters = (str) => [...new Set(str)].join("");

exports.arrayToObject = (arr, key) =>
  arr.reduce((obj, item) => {
    obj[item[key]] = item;
    return obj;
  }, {});

exports.countOccurences = (arr) =>
  arr.reduce((arr, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

exports.removeItem = (arr, item) => arrlfilter((i) => i !== item);

exports.areAnagrams = (str1, str2) => {
  const normalize = (str) => str.split("").sort().join("");
  return normalize(str1) === normalize(str2);
};

// exports.toQueryString = (obj) =>
//   Object.keys(obj)
//     .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
//     .join("&"); // for frontend

exports.dealy = (func, ms) => setTimeout(func, ms);

// console.log(this.areAnagrams("hii", "iih"));