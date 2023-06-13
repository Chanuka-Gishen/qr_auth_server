import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../config/cloudinary.config.js";

const qrFolderPath = path.join("public", "qr");

export const generateAndSaveQRCode = async (url, userId) => {
  try {
    const QR_CODE_FILENAME = "qr_" + userId + ".png";
    // Generate the QR code image as a buffer
    const qrCodeBuffer = await QRCode.toBuffer(url);

    // Upload the QR code buffer to Cloudinary
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "qr_codes",
          resource_type: "image",
          public_id: "qr_codes" + QR_CODE_FILENAME,
          format: "png",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.write(qrCodeBuffer);
      uploadStream.end();
    });

    console.log(
      "QR code image uploaded to Cloudinary:",
      cloudinaryResult.secure_url
    );
    return cloudinaryResult.secure_url;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

export const generateQRCode = async (url, userId) => {
  try {
    // Generate the QR code as a PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(url, { type: "png" });

    // Generate a unique filename for the temporary file
    const tempFilename = "QR-" + userId + ".png";

    // Save the QR code buffer to a temporary file
    const tempFilePath = path.join(qrFolderPath, tempFilename);

    if (!fs.existsSync(qrFolderPath)) {
      fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, qrCodeBuffer);

    // Upload the QR code buffer to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
      folder: "QrCodes", // Specify the folder where you want to save the QR codes
      //use_filename: true, // Optionally specify the public ID for the QR code image
      //overwrite: true, // Overwrite if a file with the same name already exists
      //resource_type: "image", // Specify the resource type as 'image'
    });

    // Return the Cloudinary upload result
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

export const convertIntoByteArray = (filePath) => {
  // Read the file as binary data
  const fileData = fs.readFileSync(filePath);

  // Convert binary data to byte array
  return Array.from(fileData);
};
