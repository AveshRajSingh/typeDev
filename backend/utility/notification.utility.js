import nodemailer from "nodemailer";
import TelegramBot from "node-telegram-bot-api";
import Notification from "../models/notification.model.js";
import { transporter } from "./transportar.utility.js";

// Initialize Telegram Bot (only if credentials provided)
let telegramBot = null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

if (TELEGRAM_BOT_TOKEN && TELEGRAM_ADMIN_CHAT_ID) {
  try {
    telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
    console.log("✅ Telegram Bot initialized");
  } catch (error) {
    console.warn("⚠️  Telegram Bot initialization failed:", error.message);
  }
} else {
  console.warn("⚠️  Telegram credentials not provided. Telegram notifications disabled.");
}

/**
 * Send notification via all channels (Email, Telegram, In-app)
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 */
export const sendAdminNotification = async (type, data) => {
  const notifications = [];
  
  try {
    // 1. Create in-app notification for all admins
    const inAppNotification = await createInAppNotification(type, data);
    notifications.push({ channel: "in-app", success: true, data: inAppNotification });
  } catch (error) {
    console.error("In-app notification failed:", error);
    notifications.push({ channel: "in-app", success: false, error: error.message });
  }
  
  try {
    // 2. Send email notification
    const emailResult = await sendEmailNotification(type, data);
    notifications.push({ channel: "email", success: true, data: emailResult });
  } catch (error) {
    console.error("Email notification failed:", error);
    notifications.push({ channel: "email", success: false, error: error.message });
  }
  
  try {
    // 3. Send Telegram notification
    const telegramResult = await sendTelegramNotification(type, data);
    notifications.push({ channel: "telegram", success: true, data: telegramResult });
  } catch (error) {
    console.error("Telegram notification failed:", error);
    notifications.push({ channel: "telegram", success: false, error: error.message });
  }
  
  return notifications;
};

/**
 * Create in-app notification
 */
const createInAppNotification = async (type, data) => {
  const notificationData = formatNotificationData(type, data);
  
  const notifications = await Notification.createForAdmins({
    type,
    title: notificationData.title,
    message: notificationData.message,
    relatedOrderId: data.orderId || null,
    relatedUserId: data.userId || null,
    actionUrl: notificationData.actionUrl,
    metadata: data
  });
  
  return notifications;
};

/**
 * Send email notification to admin
 */
const sendEmailNotification = async (type, data) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  if (!ADMIN_EMAIL) {
    throw new Error("Admin email not configured");
  }
  
  const notificationData = formatNotificationData(type, data);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `[TypingApp] ${notificationData.title}`,
    html: generateEmailHTML(notificationData, data)
  };
  
  const info = await transporter.sendMail(mailOptions);
  return info;
};

/**
 * Send Telegram notification
 */
const sendTelegramNotification = async (type, data) => {
  if (!telegramBot || !TELEGRAM_ADMIN_CHAT_ID) {
    throw new Error("Telegram not configured");
  }
  
  const notificationData = formatNotificationData(type, data);
  const message = formatTelegramMessage(notificationData, data);
  
  const result = await telegramBot.sendMessage(TELEGRAM_ADMIN_CHAT_ID, message, {
    parse_mode: "HTML",
    disable_web_page_preview: true
  });
  
  return result;
};

/**
 * Format notification data based on type
 */
const formatNotificationData = (type, data) => {
  switch (type) {
    case "payment_submitted":
      return {
        title: "💰 New Payment Submitted",
        message: `User ${data.username} submitted payment for ${data.planType} plan (₹${data.amount}). Transaction ID: ${data.txnId}`,
        actionUrl: `/admin/payments?orderId=${data.orderId}`
      };
      
    case "payment_verified":
      return {
        title: "✅ Payment Verified",
        message: `Payment for ${data.username} (${data.planType} - ₹${data.amount}) has been verified and premium activated.`,
        actionUrl: `/admin/payments?orderId=${data.orderId}`
      };
      
    case "payment_failed":
      return {
        title: "❌ Payment Verification Failed",
        message: `Payment verification failed for order ${data.orderId}. Reason: ${data.reason}`,
        actionUrl: `/admin/payments?orderId=${data.orderId}`
      };
      
    case "reconciliation_complete":
      return {
        title: "📊 Reconciliation Complete",
        message: `Bank statement reconciliation completed. Matched: ${data.matched}, Unmatched: ${data.unmatched}`,
        actionUrl: `/admin/payments?tab=reconciliation`
      };
      
    case "order_expired":
      return {
        title: "⏰ Order Expired",
        message: `Order ${data.orderId} for user ${data.username} has expired without payment.`,
        actionUrl: `/admin/payments?orderId=${data.orderId}`
      };
      
    case "premium_expired":
      return {
        title: "🔓 Premium Expired",
        message: `Premium subscription expired for ${data.count} users.`,
        actionUrl: `/admin/users?filter=expired`
      };
      
    default:
      return {
        title: "🔔 Notification",
        message: JSON.stringify(data),
        actionUrl: "/admin/payments"
      };
  }
};

/**
 * Generate HTML email template
 */
const generateEmailHTML = (notificationData, data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${notificationData.title}</h2>
        </div>
        <div class="content">
          <p>${notificationData.message}</p>
          ${generateDetailsSection(data)}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${notificationData.actionUrl}" class="button">
            View Details
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate details section for email
 */
const generateDetailsSection = (data) => {
  if (!data) return "";
  
  let html = '<div class="details"><strong>Details:</strong>';
  
  if (data.orderId) html += `<div class="detail-row"><span>Order ID:</span><span>${data.orderId}</span></div>`;
  if (data.username) html += `<div class="detail-row"><span>User:</span><span>${data.username}</span></div>`;
  if (data.email) html += `<div class="detail-row"><span>Email:</span><span>${data.email}</span></div>`;
  if (data.planType) html += `<div class="detail-row"><span>Plan:</span><span>${data.planType}</span></div>`;
  if (data.amount) html += `<div class="detail-row"><span>Amount:</span><span>₹${data.amount}</span></div>`;
  if (data.txnId) html += `<div class="detail-row"><span>Transaction ID:</span><span>${data.txnId}</span></div>`;
  if (data.timestamp) html += `<div class="detail-row"><span>Time:</span><span>${new Date(data.timestamp).toLocaleString()}</span></div>`;
  
  html += '</div>';
  return html;
};

/**
 * Format Telegram message
 */
const formatTelegramMessage = (notificationData, data) => {
  let message = `<b>${notificationData.title}</b>\n\n`;
  message += `${notificationData.message}\n\n`;
  
  if (data.orderId) message += `📦 Order ID: <code>${data.orderId}</code>\n`;
  if (data.username) message += `👤 User: ${data.username}\n`;
  if (data.email) message += `📧 Email: ${data.email}\n`;
  if (data.planType) message += `💎 Plan: ${data.planType}\n`;
  if (data.amount) message += `💰 Amount: ₹${data.amount}\n`;
  if (data.txnId) message += `🔖 Transaction: <code>${data.txnId}</code>\n`;
  if (data.timestamp) message += `🕐 Time: ${new Date(data.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
  
  message += `\n<a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}${notificationData.actionUrl}">View in Dashboard →</a>`;
  
  return message;
};

/**
 * Send user notification (payment confirmation)
 */
export const sendUserNotification = async (email, type, data) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: getUserEmailSubject(type),
      html: generateUserEmailHTML(type, data)
    };
    
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("User notification email failed:", error);
    throw error;
  }
};

/**
 * Get email subject for user notifications
 */
const getUserEmailSubject = (type) => {
  switch (type) {
    case "payment_pending":
      return "⏳ Payment Submitted - Awaiting Verification";
    case "payment_success":
      return "✅ Premium Activated - Welcome!";
    case "premium_expiring_soon":
      return "⏰ Your Premium Expires Soon";
    case "premium_expired":
      return "🔓 Your Premium Has Expired";
    default:
      return "📧 Notification from TypingApp";
  }
};

/**
 * Generate user email HTML
 */
const generateUserEmailHTML = (type, data) => {
  let content = "";
  
  switch (type) {
    case "payment_pending":
      content = `
        <p>Hi ${data.username},</p>
        <p>We received your payment submission for <strong>${data.planType} plan (₹${data.amount})</strong>.</p>
        <p>Our team is verifying the payment. You'll receive a confirmation email once your premium is activated (usually within 24 hours).</p>
        <p><strong>Order ID:</strong> ${data.orderId}<br>
        <strong>Transaction ID:</strong> ${data.txnId}</p>
      `;
      break;
      
    case "payment_success":
      content = `
        <p>Hi ${data.username},</p>
        <p>🎉 Your payment has been verified and <strong>Premium is now active</strong>!</p>
        <p><strong>Plan:</strong> ${data.planType}<br>
        <strong>Valid Until:</strong> ${new Date(data.expiresAt).toLocaleDateString('en-IN')}</p>
        <p>Enjoy unlimited typing tests, AI feedback, and more!</p>
      `;
      break;
      
    case "premium_expiring_soon":
      content = `
        <p>Hi ${data.username},</p>
        <p>Your premium subscription expires on <strong>${new Date(data.expiresAt).toLocaleDateString('en-IN')}</strong>.</p>
        <p>Renew now to continue enjoying premium features!</p>
      `;
      break;
      
    case "premium_expired":
      content = `
        <p>Hi ${data.username},</p>
        <p>Your premium subscription has expired. You can renew anytime to regain access to premium features.</p>
      `;
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>⚡ TypingApp</h2>
        </div>
        <div class="content">
          ${content}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/${data.username}" class="button">
            Go to Dashboard
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};
