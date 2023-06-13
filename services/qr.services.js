import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary.config.js";

const qrFolderPath = path.join("tmp", "qr");

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
      folder: "qr_codes", // Specify the folder where you want to save the QR codes
      use_filename: true, // Optionally specify the public ID for the QR code image
      overwrite: true, // Overwrite if a file with the same name already exists
      resource_type: "image", // Specify the resource type as 'image'
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
