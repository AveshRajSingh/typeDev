import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
    // Admin user who should see this notification
  },
  type: {
    type: String,
    enum: [
      "payment_submitted",
      "payment_verified",
      "payment_failed",
      "reconciliation_complete",
      "order_expired",
      "premium_expired"
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
    // Short notification title
  },
  message: {
    type: String,
    required: true
    // Detailed notification message
  },
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
  },
  relatedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
    // User related to this notification (e.g., user who made payment)
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
    // URL for quick action (e.g., /admin/payments?orderId=123)
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // Additional data (order details, user info, etc.)
  }
}, {
  timestamps: true
});

// Index for fetching unread notifications for admin
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

// TTL index to auto-delete old read notifications after 30 days
notificationSchema.index({ readAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to create notification for all admin users
notificationSchema.statics.createForAdmins = async function(notificationData) {
  const User = mongoose.model("User");
  
  // Find all admin users
  const admins = await User.find({ isAdmin: true }).select("_id").lean();
  
  if (admins.length === 0) {
    console.warn("No admin users found to send notification");
    return [];
  }
  
  // Create notification for each admin
  const notifications = admins.map(admin => ({
    recipientId: admin._id,
    ...notificationData
  }));
  
  return await this.insertMany(notifications);
};

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
