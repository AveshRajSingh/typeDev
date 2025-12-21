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
    // Add timeout and connection settings for better reliability
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000, // 5 seconds
    socketTimeout: 10000, // 10 seconds
    // For port 587, require STARTTLS
    requireTLS: emailPort === 587,
    tls: {
        // Do not fail on invalid certs (use with caution in production)
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        minVersion: 'TLSv1.2'
    },
    // Enable debug output
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
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
        from: `"TypeDev" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
    };

    try {
        console.log(`📧 Attempting to send email to: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true, message: 'Email sent successfully', messageId: info.messageId };
    } catch (err) {
        console.error('❌ Error sending email:', { 
            to, 
            subject, 
            error: err.message,
            code: err.code,
            command: err.command
        });
        
        // Provide more specific error messages
        if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKET') {
            throw new Error('Email service temporarily unavailable. Please try again later.');
        } else if (err.code === 'EAUTH') {
            throw new Error('Email authentication failed. Please contact support.');
        } else if (err.responseCode === 550) {
            throw new Error('Invalid email address.');
        }
        
        // Throw original error for other cases
        throw err;
    }
}

// Verify SMTP connection on startup
const verifyConnection = async () => {
    try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('❌ SMTP connection verification failed:', error.message);
        console.error('⚠️  Email functionality may not work properly');
        return false;
    }
};

// Verify connection when module loads (non-blocking)
verifyConnection();

export { transporter, sendMail, verifyConnection };