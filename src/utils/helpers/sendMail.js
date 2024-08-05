const { createTransport } = require("nodemailer");
const { SMTPMAIL, SMTPPASS } = process.env;

const { sendMail } = createTransport({
  host: "smtp.example.com",
  port: 578,
  secure: false,
  auth: {
    user: SMTPMAIL,
    pass: SMTPPASS,
  },
});

exports.sendMailToUser = (
  from = "sender@mailinator.com",
  to = "test@mailinator.com",
  subject = "Subject for Mail",
  text = "body",
  html = "<h1>Hello World Testing</>"
) => {
  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };
  sendMail(mailOptions, (error, info) => {
    if (error) return console.log({ error });
    console.log("Message sent: %s", info.messageId);
  });
};
