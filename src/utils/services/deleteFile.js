import fs from "fs";
import path from "path";

/**
 * Deletes the file at the given path if it exists.
 * @param {string} filePath - Absolute or relative path to the file.
 */
const deleteFile = (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.warn(`Deleted: ${fullPath}`);
    } else {
      console.warn(`File not found: ${fullPath}`);
    }
  } catch (err) {
    console.error(`Error deleting file: ${filePath}`, err);
  }
};

export default deleteFile;
