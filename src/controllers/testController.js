import { promiseHandler } from "#helpers/promiseHandler";
import { SuccessSend, ErrorSend } from "#helpers/response";
import { sendMailToUser } from "../utils/services/sendMail.js";
export const test = promiseHandler(async (req, res) => {
  // return res.send('boom')
  const attachments = [
    {
      // use URL as an attachment
      filename: "license.txt",
      path: "https://raw.github.com/nodemailer/nodemailer/master/LICENSE",
    },
    {
      // utf-8 string as an attachment
      filename: "text1.txt",
      content: "hello world!",
    },
  ];
  sendMailToUser({
    to: "test.kangaroo@yopmail.com",
    subject: "testing mail",
    attachments,
  });
  res.status(200).json(new SuccessSend(200, "test response"));
});
