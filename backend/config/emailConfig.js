import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
host: "smtp.gmail.com", // e.g., smtp.gmail.com or Mailtrap SMTP
port: process.env.MailPort,
secure: false, // true for 465, false for other ports
auth: {
user: process.env.MailService,
pass: process.env.MailPassword
}
});

export default transporter