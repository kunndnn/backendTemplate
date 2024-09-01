const fs = require("fs");
const path = require("path");
const { ErrorSend } = require("../helpers/response");
// Path to the original file

exports.bufferToImage = (fileString, saveLocation) => {
  // Extract MIME type and Base64 data
  const matches = fileString.match(
    /^data:(image\/(png|jpg|jpeg));base64,(.+)$/
  );

  if (!matches) {
    throw new ErrorSend(
      400,
      'Invalid file format. Ensure it is in the format "data:image/png;base64,...".'
    );
  }

  const extension = matches[2]; // Extract the extension
  const base64Data = matches[3]; // Extract the base64 data

  const bufferContent = Buffer.from(base64Data, "base64");
  const fileName = `${Date.now()}.${extension}`;

  // Reference the existing 'public' folder
  const publicFolderPath = path.join(process.cwd(), "public", saveLocation);
  const filePath = path.join(publicFolderPath, fileName);

  // Ensure the save directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Write the buffer to a file
  fs.writeFileSync(filePath, bufferContent);

  return `${saveLocation}/${fileName}`; // send the path with filename

  // usage const fileName = bufferToImage(file, "images");
};
