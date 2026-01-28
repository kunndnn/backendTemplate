import sharp from "sharp";
import fs from "fs";
import path from "path";
import deleteFile from "./deleteFile.js";

const addImageWatermark = async (
  inputImagePath,
  watermarkImagePath,
  outputImageName
) => {
  const outputDir = path.join(__dirname, "public", "output");
  const outputImagePath = path.join(outputDir, outputImageName);

  // 1. Ensure output directory exists
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 2. Prepare images
  const inputImage = sharp(inputImagePath);
  const { width } = await inputImage.metadata();

  const watermark = await sharp(watermarkImagePath)
    .resize({ width: Math.floor(width * 0.3) })
    .png()
    .toBuffer();

  // 3. Composite and save output image
  await inputImage
    .composite([
      {
        input: watermark,
        gravity: "southeast",
        blend: "overlay",
      },
    ])
    .toFile(outputImagePath);

  console.warn("Watermarked image saved:", outputImagePath);

  // 4. Delete input and watermark files
  [inputImagePath, watermarkImagePath].forEach((filePath) =>
    deleteFile(filePath)
  );
};

export default addImageWatermark;
