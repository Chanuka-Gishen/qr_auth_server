import QRCode from "qrcode";
import path from "path";
import fs from "fs";

const qrFolderPath = path.join("public", "qr");

export const generateAndSaveQRCode = async (url, userId) => {
  const QR_CODE_FILENAME = "qr_" + userId + ".png";
  try {
    const filePath = path.join(qrFolderPath, QR_CODE_FILENAME);

    if (!fs.existsSync(qrFolderPath)) {
      fs.mkdirSync(qrFolderPath, { recursive: true });
    }

    await QRCode.toFile(filePath, url);
    console.log(`QR code generated and saved successfully at ${filePath}`);
    return filePath;
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
