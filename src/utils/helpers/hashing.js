import crypto from "crypto";
const { secretKey, secretIv, encryptionMethod, hashMethod } = process.env;

const key = crypto
  .createHash(hashMethod)
  .update(secretKey, "utf-8")
  .digest("hex")
  .substr(0, 32);

const iv = crypto
  .createHash(hashMethod)
  .update(secretIv, "utf-8")
  .digest("hex")
  .substr(0, 16);

const encryptData = (normalText) => {
  const encryptor = crypto.createCipheriv(encryptionMethod, key, iv);
  const aes_encrypted =
    encryptor.update(normalText, "utf8", "base64") + encryptor.final("base64");
  return Buffer.from(aes_encrypted).toString("base64");
};

const decryptData = (encryptedText) => {
  const buff = Buffer.from(encryptedText, "base64");
  encryptedText = buff.toString("utf-8");
  const decryptor = crypto.createDecipheriv(encryptionMethod, key, iv);
  return (
    decryptor.update(encryptedText, "base64", "utf8") + decryptor.final("utf8")
  );
};
export { encryptData, decryptData };
