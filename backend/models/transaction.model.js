import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null,
    index: true
    // Linked order after reconciliation, null for orphan transactions
  },
  amount: {
    type: Number,
    required: true,
    index: true
    // Amount from bank statement
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
    // Bank transaction ID / UTR number
  },
  date: {
    type: Date,
    required: true,
    index: true
    // Transaction date from bank statement
  },
  description: {
    type: String,
    default: null
    // Transaction description/narration from bank
  },
  reconciliationStatus: {
    type: String,
    enum: ["unmatched", "matched", "manual_review", "ignored"],
    default: "unmatched",
    index: true
  },
  matchedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    default: null
    // Order that was matched during reconciliation
  },
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
    // Confidence percentage of the match (0-100)
  },
  reconciliationNotes: {
    type: String,
    default: null
    // Notes about why/how this was matched
  },
  importBatchId: {
    type: String,
    required: true,
    index: true
    // Unique ID for each CSV import batch
  },
  importedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    // Admin who imported the CSV
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
    // Original CSV row data for debugging
  }
}, {
  timestamps: true
});

// Index for finding unmatched transactions
transactionSchema.index({ reconciliationStatus: 1, amount: 1 });

// Static method to find potential order matches for a transaction
transactionSchema.statics.findPotentialMatches = async function(amount, transactionId) {
  const Order = mongoose.model("Order");
  
  // Strategy 1: Exact amount + exact UPI transaction ID (100% confidence)
  const exactMatch = await Order.findOne({
    uniqueAmount: amount,
    userSubmittedTxnId: transactionId,
    status: { $in: ["submitted", "pending"] },
    bankReconciled: false
  });
  
  if (exactMatch) {
    return [{ order: exactMatch, confidence: 100, method: "exact_amount_and_txn_id" }];
  }
  
  // Strategy 2: Exact amount match (95% confidence)
  const amountMatches = await Order.find({
    uniqueAmount: amount,
    status: { $in: ["submitted", "pending"] },
    bankReconciled: false
  }).sort({ createdAt: -1 }).limit(5);
  
  if (amountMatches.length > 0) {
    return amountMatches.map(order => ({
      order,
      confidence: amountMatches.length === 1 ? 95 : 85,
      method: "exact_amount"
    }));
  }
  
  // Strategy 3: Fuzzy amount match ±0.02 (70% confidence - needs manual review)
  const fuzzyMatches = await Order.find({
    uniqueAmount: { $gte: amount - 0.02, $lte: amount + 0.02 },
    status: { $in: ["submitted", "pending"] },
    bankReconciled: false
  }).sort({ createdAt: -1 }).limit(10);
  
  if (fuzzyMatches.length > 0) {
    return fuzzyMatches.map(order => ({
      order,
      confidence: 70,
      method: "fuzzy_amount"
    }));
  }
  
  return [];
};

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
