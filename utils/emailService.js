import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendQuizConfirmationMail = async ({ to, subject, html }) => {
  //  console.log(process.env.MAIL_USER, process.env.MAIL_PASS,to,subject,html);
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html
  });
};
