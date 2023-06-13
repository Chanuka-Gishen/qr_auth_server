import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import CustomResponse from "../services/response.services.js";
import { generateToken, verifyToken } from "../services/token.services.js";
import {
  convertIntoByteArray,
  generateAndSaveQRCode,
} from "../services/qr.services.js";
import { generateRandomPin } from "../services/util.services.js";
import {
  encryptPin,
  isEncryptedPinMatch,
} from "../services/encryption.services.js";
import { sendEmailEmbeddedTemplate } from "../services/mail.services.js";
import { resolve } from "path";
import { __dirname } from "../constants/common.constants.js";

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const { userEmail, userMobile, userPassword } = req.body;

    const newUser = new User({
      userEmail,
      userMobile,
      userPassword,
      userLoginStatus: "LOGGED_OFF",
    });

    await newUser.save();

    res.status(201).json(new CustomResponse("auth_000", "User Created"));
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json(new CustomResponse("auth_003", "User not created", toString(err)));
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    const user = await User.findOne({ userEmail: userEmail });
    if (!user)
      return res
        .status(200)
        .json(new CustomResponse("auth_003", "User not found"));

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch)
      return res
        .status(200)
        .json(new CustomResponse("auth_003", "Invalid password"));

    const token = generateToken(user._id);

    user.userToken = token;
    user.userLoginStatus = "CREDENTIAL_VERIFIED";

    const updatedUser = await user.save();

    delete updatedUser.userPassword;
    res
      .status(200)
      .json(new CustomResponse("auth_000", "Login successful", updatedUser));
  } catch (err) {
    console.log(err);
    res.status(500).json(new CustomResponse("auth_003", "Login failed"));
  }
};

/* GENERATING QR */
export const generateQR = async (req, res) => {
  try {
    const tokenPayload = verifyToken(req);

    // Update the URL once finalized the frontend
    const url = "www.google.com";
    const qrFilePath = await generateAndSaveQRCode(url, tokenPayload.id);

    const qrToByteArray = convertIntoByteArray(qrFilePath);

    res
      .status(201)
      .json(new CustomResponse("auth_000", "QR created", qrToByteArray));
  } catch (err) {
    console.log(err);
    res.status(500).json(new CustomResponse("auth_003", "QR generate failed"));
  }
};

/* GENERATING AUTH ENCRYPTED PIN */
export const generatePin = async (req, res) => {
  try {
    const { userEmail } = req.body;

    const user = await User.findOne({ userEmail });

    if (!user) {
      return res
        .status(400)
        .json(new CustomResponse("auth_003", "User not found"));
    }

    if (user.userLoginStatus != "CREDENTIAL_VERIFIED") {
      return res
        .status(400)
        .json(new CustomResponse("auth_003", "User not logged in"));
    }

    const pin = generateRandomPin();
    const encryptedPin = encryptPin(pin);

    const expireAt = new Date(Date.now() + 3 * 60 * 1000); // expires from 3 minutes

    user.userPin = pin;
    user.userPinExpireAt = expireAt;

    await user.save();

    // Send PIN through mail - Temp
    const pathTemplate = resolve(
      __dirname,
      "../assets/html/qr-pin-mail-template.html"
    );
    await sendEmailEmbeddedTemplate(
      {
        to: user.userEmail,
        subject: "Pin verification - Login",
        dataToEmbedded: {
          otp: encryptedPin,
        },
      },
      pathTemplate
    );

    return res.status(200).json(new CustomResponse("auth_000", "Pin sent"));
  } catch (err) {
    console.log(err);
    res.status(500).json(new CustomResponse("auth_003", "Pin generate failed"));
  }
};

/* VERIFY ENCRYPTED PIN */
export const verifyPin = async (req, res) => {
  const { pin, userEmail } = req.body;

  if (pin === null) {
    return res.status(400).json(new CustomResponse("auth_003", "Empty pin"));
  }

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res
      .status(400)
      .json(new CustomResponse("auth_003", "user not found"));
  }

  if (user.userPin === null) {
    return res
      .status(400)
      .json(new CustomResponse("auth_003", "Pin not generated"));
  }

  // Get the current time
  const currentTime = new Date();

  // Compare the expiration time with the current time
  if (user.userPinExpireAt <= currentTime) {
    // The expiration time has passed
    return res.status(400).json(new CustomResponse("auth_003", "Pin expired"));
  }

  // The expiration time has not yet passed
  const isPinMatching = isEncryptedPinMatch(pin, user.userPin);

  if (!isPinMatching) {
    return res.status(400).json(new CustomResponse("auth_003", "Invalid pin"));
  }

  user.userPin = null;
  user.userPinExpireAt = null;
  user.userLoginStatus = "LOGGED_IN";

  await user.save();

  return res.status(200).json(new CustomResponse("auth_000", "Pin verified"));
};
