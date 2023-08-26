import nodemailer from "nodemailer";
import { Email } from "../models/types/general";

const sendEmail = ({ subject, body, send_to, sent_from, reply_to }: Email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: body,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) return console.log(err);

    console.log("INFO", info);
  });
};

export default sendEmail;
