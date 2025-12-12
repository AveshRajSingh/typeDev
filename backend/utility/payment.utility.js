import QRCode from "qrcode";
import Order from "../models/order.model.js";
import {User} from "../models/user.model.js";

// UPI Configuration
const UPI_CONFIG = {
  vpa: "9142416064@ibl",
  payeeName: "Avesh Raj Singh",
  currency: "INR"
};

// Plan Configuration
export const PLAN_CONFIG = {
  test: {
    amount: 2,
    durationDays: 1,
    label: "Test Plan"
  },
  monthly: {
    amount: 69,
    durationDays: 30,
    label: "Monthly Premium"
  },
  yearly: {
    amount: 200,
    durationDays: 365,
    label: "Yearly Premium"
  },
  lifetime: {
    amount: 599,
    durationDays: 36500, // 100 years
    label: "Lifetime Premium"
  }
};

/**
 * Generate unique amount with paise suffix for order tracking
 * @param {string} planType - monthly, yearly, or lifetime
 * @param {number} paiseSequence - Sequence number (1-99)
 * @returns {number} - Unique amount with paise suffix
 */
export const generateUniqueAmount = (planType, paiseSequence) => {
  const baseAmount = PLAN_CONFIG[planType].amount;
  const uniqueAmount = baseAmount + (paiseSequence / 100);
  return Math.round(uniqueAmount * 100) / 100; // Ensure 2 decimal places
};

/**
 * Generate UPI payment string
 * @param {string} orderId - MongoDB order ID
 * @param {number} amount - Payment amount
 * @returns {string} - UPI payment string
 */
export const generateUPIString = (orderId, amount) => {
  const params = new URLSearchParams({
    pa: UPI_CONFIG.vpa,
    pn: UPI_CONFIG.payeeName,
    am: amount.toFixed(2),
    cu: UPI_CONFIG.currency,
    tn: `ORDER_${orderId}`
  });
  
  return `upi://pay?${params.toString()}`;
};

/**
 * Generate QR code as base64 string
 * @param {string} upiString - UPI payment string
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateQRCode = async (upiString) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error("QR Code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Activate premium subscription for user
 * @param {string} userId - User MongoDB ID
 * @param {string} planType - monthly, yearly, or lifetime
 * @returns {Promise<Object>} - Updated user object
 */
export const activatePremium = async (userId, planType) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const plan = PLAN_CONFIG[planType];
    if (!plan) {
      throw new Error("Invalid plan type");
    }
    
    const now = new Date();
    let newExpiryDate;
    
    // If user already has premium, extend from current expiry
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now) {
      newExpiryDate = new Date(user.premiumExpiresAt);
      newExpiryDate.setDate(newExpiryDate.getDate() + plan.durationDays);
    } else {
      // New premium or expired premium
      newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + plan.durationDays);
    }
    
    user.isPremium = true;
    user.premiumExpiresAt = newExpiryDate;
    
    // Reset free quotas for premium users
    if (planType === 'lifetime') {
      user.freeFeedbackLeft = 999999; // Effectively unlimited
      user.freeParagraphGenLeft = 999999;
    } else {
      user.freeFeedbackLeft = 100; // Premium users get more
      user.freeParagraphGenLeft = 50;
    }
    
    await user.save();
    
    return {
      userId: user._id,
      username: user.username,
      email: user.email,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      planType,
      activatedAt: now
    };
  } catch (error) {
    console.error("Premium activation failed:", error);
    throw error;
  }
};

/**
 * Check and deactivate expired premium subscriptions
 * @returns {Promise<number>} - Number of expired premiums deactivated
 */
export const deactivateExpiredPremiums = async () => {
  try {
    const now = new Date();
    
    const result = await User.updateMany(
      {
        isPremium: true,
        premiumExpiresAt: { $lt: now }
      },
      {
        $set: {
          isPremium: false,
          freeFeedbackLeft: 20, // Reset to verified user quota
          freeParagraphGenLeft: 5
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Deactivated ${result.modifiedCount} expired premium subscriptions`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error("Failed to deactivate expired premiums:", error);
    throw error;
  }
};

/**
 * Mark expired orders as expired
 * @returns {Promise<number>} - Number of orders marked as expired
 */
export const markExpiredOrders = async () => {
  try {
    const now = new Date();
    
    const result = await Order.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: now }
      },
      {
        $set: { status: "expired" }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} orders as expired`);
    }
    
    return result.modifiedCount;
  } catch (error) {
    console.error("Failed to mark expired orders:", error);
    throw error;
  }
};

/**
 * Validate UPI transaction ID format
 * @param {string} txnId - UPI transaction ID
 * @returns {boolean} - True if valid format
 */
export const validateUPITransactionId = (txnId) => {
  if (!txnId) return false;
  
  const trimmed = txnId.trim();
  
  // UPI transaction IDs can be:
  // - 12 digits (e.g., 336912345678)
  // - Alphanumeric UTR/RRN (e.g., T2312345678901)
  // Must be 10-25 characters, alphanumeric only
  if (trimmed.length < 10 || trimmed.length > 25) return false;
  
  const upiPattern = /^[A-Za-z0-9]+$/;
  return upiPattern.test(trimmed);
};

/**
 * Calculate order expiry time (30 minutes from now)
 * @returns {Date} - Expiry timestamp
 */
export const calculateOrderExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 30);
  return expiry;
};
