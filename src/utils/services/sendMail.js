import { createTransport } from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
// Required to resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  MAIL_HOST,
  MAIL_PORT,
  MAIL_FROM: from,
  SMTPMAIL,
  SMTPPASS,
} = process.env;

//setting configurations
const transport = createTransport({
  host: MAIL_HOST, // Replace with your SMTP server
  port: MAIL_PORT, //587
  secure: MAIL_PORT == 465, // true for 465, false for other ports
  auth: {
    user: SMTPMAIL, // Replace with your email
    pass: SMTPPASS, // Replace with your email password
  },
});

export const sendMailToUser = async ({
  to = "test@yopmail.com",
  cc = [],
  bcc = [],
  subject = "Subject of E-mail",
  text,
  html,
  templateData = {},
  attachments = [],
}) => {
  try {
    //setting credentials
    let mailOptions = {
      from, // Sender address
      to, // List of recipients
      subject, // Subject line
    };

    if (cc.length) mailOptions.cc = cc; // array of mails
    if (bcc.length) mailOptions.bcc = bcc; // array of mails
    if (text) mailOptions.text = text;
    if (attachments.length) mailOptions.attachments = attachments;
    if (html) {
      const templatePath = path.join(
        process.cwd(),
        "src",
        "views/emails",
        html
      );
      mailOptions.html = await ejs.renderFile(templatePath, templateData);
    }

    // sending mail
    const info = await transport.sendMail(mailOptions);
    console.warn("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Mail send error:", error);
  }
};
