import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import CustomResponse from "../services/response.services.js";
import { generateToken, verifyToken } from "../services/token.services.js";
import {
  convertIntoByteArray,
  generateAndSaveQRCode,
} from "../services/qr.services.js";

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
        .status(400)
        .json(new CustomResponse("auth_003", "User not found"));

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch)
      return res
        .status(400)
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
    const url = "www.google.com";
    console.log(tokenPayload.id);
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
