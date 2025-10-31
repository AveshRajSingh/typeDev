
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = async (to, subject, text) => {
    const mailOptions = {
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
}

export { transporter, sendMail };