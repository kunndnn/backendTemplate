import { createTransport } from "nodemailer";
const { SMTPMAIL, SMTPPASS } = process.env;

//setting configurations
const { sendMail } = createTransport({
  host: "smtp.example.com", // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: SMTPMAIL, // Replace with your email
    pass: SMTPPASS, // Replace with your email password
  },
});

export const sendMailToUser = (
  from = "sender@mailinator.com",
  to = "test@mailinator.com",
  subject = "Subject of E-mail",
  text = "body",
  html = "<h1>Hello World Testing</>"
) => {
  //setting credentials
  const mailOptions = {
    from, // Sender address
    to, // List of recipients
    subject, // Subject line
    text, // Plain text body
    html, // HTML body
  };

  // sending mail
  sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
  });
};
