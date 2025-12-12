import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  planType: {
    type: String,
    enum: ["test", "monthly", "yearly", "lifetime"],
    required: true
  },
  baseAmount: {
    type: Number,
    required: true,
    enum: [2, 69, 200, 599] // test: 2, monthly: 69, yearly: 200, lifetime: 599
  },
  uniqueAmount: {
    type: Number,
    required: true,
    // Amount with paise suffix (e.g., 69.01, 200.15, 599.42)
  },
  paiseSequence: {
    type: Number,
    required: true,
    // Unique sequence number encoded in paise (1-99)
  },
  upiString: {
    type: String,
    required: false,
    default: "",
    // Complete UPI payment string: upi://pay?pa=9142416064@ibl&pn=Avesh Raj Singh&am=69.01&cu=INR&tn=ORDER_12345
  },
  qrCodeBase64: {
    type: String,
    required: false,
    default: "",
    // Base64 encoded QR code image
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "verified", "expired", "failed"],
    default: "pending",
    index: true
  },
  userSubmittedTxnId: {
    type: String,
    default: null,
    // 12-digit UPI transaction ID submitted by user
  },
  screenshotUrl: {
    type: String,
    default: null,
    // Path to uploaded payment screenshot
  },
  bankReconciled: {
    type: Boolean,
    default: false,
    index: true
    // True when matched with bank statement transaction
  },
  reconciliationConfidence: {
    type: String,
    enum: ["high", "medium", "low", null],
    default: null,
    // Confidence level of automatic reconciliation match
  },
  expiresAt: {
    type: Date,
    required: true
    // Order expires 15 minutes after creation
  },
  verifiedAt: {
    type: Date,
    default: null
    // Timestamp when payment was verified
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
    // Admin user who manually verified the payment
  },
  notes: {
    type: String,
    default: null
    // Admin notes or reconciliation details
  }
}, {
  timestamps: true
});

// Index for finding next available paise sequence
orderSchema.index({ planType: 1, paiseSequence: 1 });

// Index for reconciliation queries
orderSchema.index({ uniqueAmount: 1, status: 1 });

// TTL index to auto-delete old expired orders after 30 days
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to get next available paise sequence
orderSchema.statics.getNextPaiseSequence = async function(planType) {
  // Only look at active (pending/submitted) orders for recycling
  const activeOrders = await this.find({
    planType,
    status: { $in: ["pending", "submitted"] }
  }).select("paiseSequence").lean();
  
  const usedSet = new Set(activeOrders.map(o => o.paiseSequence));
  
  // Find first available sequence from 1-99
  for (let i = 1; i <= 99; i++) {
    if (!usedSet.has(i)) {
      return i;
    }
  }
  
  throw new Error(`All paise sequences (1-99) are currently in use for ${planType} plan. Please try again later.`);
};

// Method to check if order is expired
orderSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Method to check if order can be submitted
orderSchema.methods.canSubmit = function() {
  return this.status === "pending" && !this.isExpired();
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
