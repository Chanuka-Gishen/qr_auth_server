import moment from "moment";
import dotenv from "dotenv";
import md5 from "md5";
import { SMS_DATE_TYPE } from "../constants/common.constants.js";
import axios from "axios";

dotenv.config();

const MASK = "";
const SUCCESS_RES = "success";

export const sendSmsDialogApi = async (mobileNumber, smsContent) => {
  await axios({
    headers: {
      "Content-Type": "application/json",
      USER: process.env.SMS_USER_NAME,
      DIGEST: md5(process.env.SMS_USER_PWD),
      CREATED: moment().format(SMS_DATE_TYPE),
    },
    method: "POST",
    url: process.env.SMS_API_URL,
    data: {
      messages: [
        {
          mask: MASK,
          clientRef: "",
          number: mobileNumber.replace(/\s/g, ""),
          text: smsContent,
          campaignName: "",
        },
      ],
    },
  })
    .then((response) => {
      if (response.data.messages[0]?.resultCode === 0) {
        return response.data;
      } else {
        const error = new Error("Sms failed");
        error.statusCode = 203;
        next(error);
        return;
      }
    })
    .catch((err) => {
      const error = new Error(toString(err));
      error.statusCode = 500;
      next(error);
      return;
    });
};

export const sendSmsNotifyApi = async (mobileNumber, smsContent) => {
  let isSmsSent = false;
  await axios({
    url: process.env.NOTF_SMS_API_URL,
    method: "POST",
    params: {
      user_id: process.env.NOTF_SMS_USER_ID,
      api_key: process.env.NOTF_SMS_API_KEY,
      sender_id: process.env.NOTF_SMS_SENDER_ID,
      to: "94" + mobileNumber,
      message: smsContent,
    },
  })
    .then((res) => {
      console.log(res.data);
      if (res.data.status === SUCCESS_RES) {
        isSmsSent = true;
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return isSmsSent;
};
