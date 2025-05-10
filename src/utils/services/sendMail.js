import { createTransport } from "nodemailer";
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

export const sendMailToUser = ({
  to = "test@yopmail.com",
  subject = "Subject of E-mail",
  text = "body",
  html = "<h1>Hello World Testing</>",
  attachments = [],
}) => {
  //setting credentials
  const mailOptions = {
    from, // Sender address
    to, // List of recipients
    subject, // Subject line
    text, // Plain text body
    html, // HTML body
  };

  // set attachments if any
  if (attachments.length) mailOptions.attachments = attachments;

  // sending mail
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};
