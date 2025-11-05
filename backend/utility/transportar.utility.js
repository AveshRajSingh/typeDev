import dotenv from "dotenv"
dotenv.config({path : "./.env"});
import nodemailer from 'nodemailer';

// Validate required environment variables
const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const emailPort = parseInt(process.env.EMAIL_PORT, 10);

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendMail = async (to, subject, text) => {
    // Input validation
    if (typeof to !== 'string' || !to.trim()) {
        throw new TypeError('sendMail: "to" must be a non-empty string');
    }
    if (typeof subject !== 'string' || !subject.trim()) {
        throw new TypeError('sendMail: "subject" must be a non-empty string');
    }
    if (typeof text !== 'string' || !text.trim()) {
        throw new TypeError('sendMail: "text" must be a non-empty string');
    }

    const mailOptions = {
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully' };
    } catch (err) {
      console.error('Error sending email', { to, subject, error: err });
        // Rethrow so callers can handle failures (keeps function async)
        return { success: false, message: err.message };
    }
}

export { transporter, sendMail };