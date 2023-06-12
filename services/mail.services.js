import dotenv from "dotenv";
import { createTransport } from "nodemailer";
import { readFileSync } from "fs";
import compile from "handlebars";

dotenv.config();

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PWD,
  },
});

/**
 * Method to connect to the mail server
 */
export const connectToMailServer = () => {
  transporter
    .verify()
    .then(() => console.info("Connected to the email server"))
    .catch((err) => console.error(err));
};

/**
 * Send an email embedded with a template
 * @param {object} data
 * @param {string} pathTemplate
 */
export const sendEmailEmbeddedTemplate = async (data, pathTemplate) => {
  const html = readFileSync(pathTemplate, "utf-8");
  const template = compile.compile(html);
  const htmlToSend = template(data.dataToEmbedded);

  // Email properties
  const mailOptions = {
    from: {
      name: process.env.SMTP_USR_NAME,
      address: process.env.SMTP_FROM_USR,
    },
    to: data.to,
    subject: data.subject,
    html: htmlToSend,
  };

  return await transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.info(`Email sent! Email ID: ${info.messageId}`);
    })
    .catch((error) => {
      throw new Error("Failed to send email: " + error);
    });
};

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 */
export const sendEmail = async (to, subject, text) => {
  const msg = { from: envConfig.email.from, to, subject, text };

  return await transporter
    .sendMail(msg)
    .then((info) => {
      console.info(`Email sent! Email ID: ${info.messageId}`);
    })
    .catch((error) => {
      throw new Error("Failed to send email: " + error);
    });
};
