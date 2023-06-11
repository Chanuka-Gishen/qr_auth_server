import moment from "moment";
import md5 from "md5";
import { SMS_DATE_TYPE } from "../constants/common.constants.js";

const MASK = "Glibs";

const sendSms = async (mobileNumber, smsContent) => {
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

export default sendSms;
