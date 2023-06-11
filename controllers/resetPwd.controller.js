import User from "../models/User.model.js";
import ResetPwdModel from "../models/resetPwd.model.js";
import CustomResponse from "../services/response.services.js";
import sendSms from "../services/sms.service.js";
import { generateRandomPin } from "../services/util.services.js";

export const verifyEmail = async (req, res) => {
  const { userEmail } = req.body;

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "User not found"));
  }

  const otp = generateRandomPin();

  await ResetPwdModel.create({
    resetUserId: user._id,
    resetUserPin: otp,
  });

  //const message = "Use this OTP to reset your password - " + otp;

  //await sendSms(user.userMbile, message);

  return res.status(200).json(new CustomResponse("auth_000", "OTP sent"));
};

export const verifyOtp = async (req, res) => {
  const { resetUserPin, userEmail } = req.body;

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "User not found"));
  }

  const resetPin = await ResetPwdModel.findOne({ resetUserId: user._id });

  if (!resetPin) {
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "OTP not found"));
  }

  if (resetUserPin != resetPin.resetUserPin) {
    return res.status(404).json(new CustomResponse("auth_004", "Invalid OTP"));
  }

  await ResetPwdModel.deleteOne({ resetUserId: user._id });

  return res.status(200).json(new CustomResponse("auth_000", "OTP verified"));
};

export const resetPassword = async (req, res) => {
  const { userEmail, newPassword } = req.body;

  const user = await User.findOne({ userEmail });

  if (!user) {
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "User not found"));
  }

  if (newPassword === null) {
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "Empty password"));
  }

  user.userPassword = newPassword;

  try {
    await user.save();
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json(new CustomResponse("auth_004", "Password change failed"));
  }
};
