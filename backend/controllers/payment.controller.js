import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import{ User }from "../models/user.model.js";
import {
  generateUniqueAmount,
  generateUPIString,
  generateQRCode,
  activatePremium,
  validateUPITransactionId,
  calculateOrderExpiry,
  PLAN_CONFIG
} from "../utility/payment.utility.js";
import { sendAdminNotification, sendUserNotification } from "../utility/notification.utility.js";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Create new payment order with QR code
 * POST /payment/create-order
 */
export const createOrder = async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user._id;
    
    // Validate plan type
    if (!PLAN_CONFIG[planType]) {
      return res.status(400).json({
        message: "Invalid plan type",
        error: "Plan must be one of: test, monthly, yearly, lifetime"
      });
    }
    
    // Check for existing pending order
    const existingOrder = await Order.findOne({
      userId,
      status: { $in: ["pending", "submitted"] },
      expiresAt: { $gt: new Date() }
    });
    
    if (existingOrder) {
      return res.status(400).json({
        message: "You already have a pending order",
        error: "Please complete or wait for the existing order to expire",
        data: {
          orderId: existingOrder._id,
          status: existingOrder.status,
          expiresAt: existingOrder.expiresAt
        }
      });
    }
    
    // Get next available paise sequence
    const paiseSequence = await Order.getNextPaiseSequence(planType);
    
    // Calculate unique amount
    const baseAmount = PLAN_CONFIG[planType].amount;
    const uniqueAmount = generateUniqueAmount(planType, paiseSequence);
    
    // Create order first to get orderId
    const order = new Order({
      userId,
      planType,
      baseAmount,
      uniqueAmount,
      paiseSequence,
      upiString: "", // Will be updated after order creation
      qrCodeBase64: "", // Will be updated after QR generation
      expiresAt: calculateOrderExpiry()
    });
    
    await order.save();
    
    // Generate UPI string with orderId
    const upiString = generateUPIString(order._id, uniqueAmount);
    
    // Generate QR code
    const qrCodeBase64 = await generateQRCode(upiString);
    
    // Update order with UPI string and QR code
    order.upiString = upiString;
    order.qrCodeBase64 = qrCodeBase64;
    await order.save();
    
    return res.status(201).json({
      message: "Order created successfully",
      data: {
        orderId: order._id,
        planType: order.planType,
        amount: order.uniqueAmount,
        baseAmount: order.baseAmount,
        upiString: order.upiString,
        qrCodeBase64: order.qrCodeBase64,
        expiresAt: order.expiresAt,
        status: order.status
      }
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};

/**
 * Submit transaction details after payment
 * POST /payment/submit-transaction
 */
export const submitTransaction = async (req, res) => {
  try {
    const { orderId, upiTransactionId } = req.body;
    const userId = req.user._id;
    const screenshot = req.file; // Optional file upload
    
    // Validate UPI transaction ID
    if (!validateUPITransactionId(upiTransactionId)) {
      return res.status(400).json({
        message: "Invalid UPI transaction ID",
        error: "Transaction ID must be a 12-digit number"
      });
    }
    
    // Find order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: "Invalid order ID"
      });
    }
    
    // Verify order belongs to user
    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Forbidden",
        error: "This order does not belong to you"
      });
    }
    
    // Check if order can be submitted
    if (!order.canSubmit()) {
      return res.status(400).json({
        message: "Cannot submit transaction for this order",
        error: order.isExpired() ? "Order has expired" : `Order status is ${order.status}`,
        data: { status: order.status, expiresAt: order.expiresAt }
      });
    }
    
    // Check for duplicate transaction ID
    const duplicateOrder = await Order.findOne({
      userSubmittedTxnId: upiTransactionId,
      _id: { $ne: orderId }
    });
    
    if (duplicateOrder) {
      return res.status(400).json({
        message: "Duplicate transaction ID",
        error: "This transaction ID has already been submitted for another order"
      });
    }
    
    // Update order with transaction details
    order.userSubmittedTxnId = upiTransactionId;
    order.status = "submitted";
    
    if (screenshot) {
      order.screenshotUrl = `/uploads/payment-screenshots/${screenshot.filename}`;
    }
    
    await order.save();
    
    // Get user details for notification
    const user = await User.findById(userId).select("username email");
    
    // Send admin notifications
    await sendAdminNotification("payment_submitted", {
      orderId: order._id,
      userId: user._id,
      username: user.username,
      email: user.email,
      planType: order.planType,
      amount: order.uniqueAmount,
      txnId: upiTransactionId,
      timestamp: new Date()
    });
    
    // Send user confirmation email
    await sendUserNotification(user.email, "payment_pending", {
      username: user.username,
      orderId: order._id,
      planType: order.planType,
      amount: order.uniqueAmount,
      txnId: upiTransactionId
    });
    
    return res.status(200).json({
      message: "Transaction submitted successfully",
      data: {
        orderId: order._id,
        status: order.status,
        message: "Your payment is being verified. You'll receive an email confirmation soon."
      }
    });
  } catch (error) {
    console.error("Submit transaction error:", error);
    return res.status(500).json({
      message: "Failed to submit transaction",
      error: error.message
    });
  }
};

/**
 * Get pending orders for admin review
 * GET /payment/pending-orders
 */
export const getPendingOrders = async (req, res) => {
  try {
    const { status = "submitted", page = 1, limit = 20 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ status })
      .populate("userId", "username email isPremium premiumExpiresAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Order.countDocuments({ status });
    
    return res.status(200).json({
      message: "Pending orders retrieved successfully",
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    return res.status(500).json({
      message: "Failed to retrieve pending orders",
      error: error.message
    });
  }
};

/**
 * Manually verify order and activate premium
 * PATCH /payment/verify/:orderId
 */
export const manualVerifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action, notes } = req.body; // action: 'approve' or 'reject'
    const adminId = req.user._id;
    
    const order = await Order.findById(orderId).populate("userId", "username email");
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: "Invalid order ID"
      });
    }
    
    if (order.status !== "submitted" && order.status !== "pending") {
      return res.status(400).json({
        message: "Cannot verify this order",
        error: `Order status is ${order.status}`
      });
    }
    
    if (action === "approve") {
      // Activate premium
      const premiumData = await activatePremium(order.userId._id, order.planType);
      
      // Update order
      order.status = "verified";
      order.verifiedAt = new Date();
      order.verifiedBy = adminId;
      order.bankReconciled = true;
      order.notes = notes || "Manually verified by admin";
      await order.save();
      
      // Send notifications
      await sendAdminNotification("payment_verified", {
        orderId: order._id,
        userId: order.userId._id,
        username: order.userId.username,
        email: order.userId.email,
        planType: order.planType,
        amount: order.uniqueAmount,
        timestamp: new Date()
      });
      
      await sendUserNotification(order.userId.email, "payment_success", {
        username: order.userId.username,
        planType: order.planType,
        amount: order.uniqueAmount,
        expiresAt: premiumData.premiumExpiresAt
      });
      
      return res.status(200).json({
        message: "Payment verified and premium activated",
        data: {
          orderId: order._id,
          status: order.status,
          premiumData
        }
      });
    } else if (action === "reject") {
      order.status = "failed";
      order.notes = notes || "Rejected by admin";
      order.verifiedBy = adminId;
      await order.save();
      
      await sendAdminNotification("payment_failed", {
        orderId: order._id,
        userId: order.userId._id,
        username: order.userId.username,
        reason: notes || "Manual rejection"
      });
      
      return res.status(200).json({
        message: "Order rejected",
        data: {
          orderId: order._id,
          status: order.status
        }
      });
    } else {
      return res.status(400).json({
        message: "Invalid action",
        error: "Action must be 'approve' or 'reject'"
      });
    }
  } catch (error) {
    console.error("Manual verify order error:", error);
    return res.status(500).json({
      message: "Failed to verify order",
      error: error.message
    });
  }
};

/**
 * Reconcile bank statement CSV with orders
 * POST /payment/reconcile
 */
export const reconcilePayments = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No CSV file uploaded",
        error: "Please upload a bank statement CSV file"
      });
    }
    
    const csvFilePath = req.file.path;
    const csvContent = fs.readFileSync(csvFilePath, "utf-8");
    
    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });
    
    if (parseResult.errors.length > 0) {
      return res.status(400).json({
        message: "CSV parsing failed",
        error: "Invalid CSV format",
        details: parseResult.errors
      });
    }
    
    const transactions = parseResult.data;
    const importBatchId = `BATCH_${Date.now()}`;
    const adminId = req.user._id;
    
    const reconciliationResults = {
      total: transactions.length,
      matched: 0,
      unmatched: 0,
      autoVerified: 0,
      needsReview: [],
      errors: []
    };
    
    // Process each transaction
    for (const row of transactions) {
      try {
        // Union Bank CSV format - adjust column names based on your bank's format
        const amount = parseFloat(row.Credit || row.credit || row["Credit Amount"] || row.Amount);
        const transactionId = (row["Transaction ID"] || row.TransactionID || row.UTR || row["Txn ID"] || "").toString().trim();
        const date = new Date(row.Date || row.date || row["Transaction Date"]);
        const description = row.Description || row.Narration || row.Remarks || "";
        
        // Skip debit transactions or invalid amounts
        if (!amount || amount <= 0 || isNaN(amount)) {
          continue;
        }
        
        // Check if transaction already imported
        const existingTxn = await Transaction.findOne({ transactionId });
        if (existingTxn) {
          console.log(`Transaction ${transactionId} already imported, skipping...`);
          continue;
        }
        
        // Find potential order matches
        const matches = await Transaction.findPotentialMatches(amount, transactionId);
        
        if (matches.length > 0) {
          const bestMatch = matches[0];
          const order = bestMatch.order;
          
          // Create transaction record
          const txn = await Transaction.create({
            orderId: order._id,
            amount,
            transactionId,
            date,
            description,
            reconciliationStatus: bestMatch.confidence >= 95 ? "matched" : "manual_review",
            matchedOrderId: order._id,
            confidenceScore: bestMatch.confidence,
            reconciliationNotes: `Matched using ${bestMatch.method} (confidence: ${bestMatch.confidence}%)`,
            importBatchId,
            importedBy: adminId,
            rawData: row
          });
          
          reconciliationResults.matched++;
          
          // Auto-verify high-confidence matches
          if (bestMatch.confidence >= 95 && order.status === "submitted") {
            try {
              // Activate premium
              await activatePremium(order.userId, order.planType);
              
              // Update order
              order.status = "verified";
              order.verifiedAt = new Date();
              order.bankReconciled = true;
              order.reconciliationConfidence = "high";
              order.notes = `Auto-verified via reconciliation (confidence: ${bestMatch.confidence}%)`;
              await order.save();
              
              reconciliationResults.autoVerified++;
              
              // Get user details
              const user = await User.findById(order.userId).select("username email");
              
              // Send notification
              await sendUserNotification(user.email, "payment_success", {
                username: user.username,
                planType: order.planType,
                amount: order.uniqueAmount,
                expiresAt: user.premiumExpiresAt
              });
            } catch (error) {
              console.error(`Auto-verification failed for order ${order._id}:`, error);
              reconciliationResults.needsReview.push({
                orderId: order._id,
                transactionId,
                amount,
                reason: "Auto-verification failed",
                error: error.message
              });
            }
          } else {
            // Needs manual review
            reconciliationResults.needsReview.push({
              orderId: order._id,
              transactionId,
              amount,
              confidence: bestMatch.confidence,
              reason: "Low confidence match"
            });
          }
        } else {
          // No matches - create orphan transaction
          await Transaction.create({
            amount,
            transactionId,
            date,
            description,
            reconciliationStatus: "unmatched",
            importBatchId,
            importedBy: adminId,
            rawData: row
          });
          
          reconciliationResults.unmatched++;
        }
      } catch (error) {
        console.error("Error processing transaction row:", error);
        reconciliationResults.errors.push({
          row,
          error: error.message
        });
      }
    }
    
    // Delete uploaded CSV file
    fs.unlinkSync(csvFilePath);
    
    // Send admin notification
    await sendAdminNotification("reconciliation_complete", {
      matched: reconciliationResults.matched,
      unmatched: reconciliationResults.unmatched,
      autoVerified: reconciliationResults.autoVerified,
      needsReview: reconciliationResults.needsReview.length,
      timestamp: new Date()
    });
    
    return res.status(200).json({
      message: "Reconciliation completed",
      data: reconciliationResults
    });
  } catch (error) {
    console.error("Reconcile payments error:", error);
    return res.status(500).json({
      message: "Reconciliation failed",
      error: error.message
    });
  }
};

/**
 * Get user's own orders
 * GET /payment/my-orders
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, includePendingDetails = false } = req.query;
    
    const skip = (page - 1) * limit;
    
    // For pending orders, include QR code and UPI string
    const selectFields = includePendingDetails === 'true' 
      ? "" // Include all fields
      : "-qrCodeBase64 -upiString"; // Exclude sensitive data for completed orders
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(selectFields);
    
    const total = await Order.countDocuments({ userId });
    
    return res.status(200).json({
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      message: "Failed to retrieve orders",
      error: error.message
    });
  }
};

/**
 * Get order status
 * GET /payment/order-status/:orderId
 */
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findById(orderId).select("-qrCodeBase64 -upiString");
    
    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: "Invalid order ID"
      });
    }
    
    // Verify order belongs to user (unless admin)
    if (!req.user.isAdmin && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Forbidden",
        error: "This order does not belong to you"
      });
    }
    
    return res.status(200).json({
      message: "Order status retrieved successfully",
      data: {
        orderId: order._id,
        status: order.status,
        planType: order.planType,
        amount: order.uniqueAmount,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt,
        verifiedAt: order.verifiedAt,
        isExpired: order.isExpired()
      }
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return res.status(500).json({
      message: "Failed to retrieve order status",
      error: error.message
    });
  }
};

/**
 * Get admin notifications
 * GET /payment/notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { isRead, limit = 20 } = req.query;
    
    const query = { recipientId: adminId };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("relatedOrderId", "planType uniqueAmount status")
      .populate("relatedUserId", "username email");
    
    const unreadCount = await Notification.countDocuments({
      recipientId: adminId,
      isRead: false
    });
    
    return res.status(200).json({
      message: "Notifications retrieved successfully",
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      message: "Failed to retrieve notifications",
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 * PATCH /payment/notifications/:notificationId/read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const adminId = req.user._id;
    
    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: adminId
    });
    
    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }
    
    await notification.markAsRead();
    
    return res.status(200).json({
      message: "Notification marked as read",
      data: notification
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
};
