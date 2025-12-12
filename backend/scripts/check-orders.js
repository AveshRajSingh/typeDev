/**
 * Check current payment orders status
 * Shows how many sequences are in use per plan type
 * 
 * Usage: node scripts/check-orders.js
 */

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

async function checkOrdersStatus() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("=" .repeat(60));
    console.log("📊 PAYMENT ORDERS STATUS REPORT");
    console.log("=" .repeat(60));
    console.log();

    // Overall statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const submittedOrders = await Order.countDocuments({ status: "submitted" });
    const verifiedOrders = await Order.countDocuments({ status: "verified" });
    const expiredOrders = await Order.countDocuments({ status: "expired" });
    const failedOrders = await Order.countDocuments({ status: "failed" });

    console.log("📈 OVERALL STATISTICS");
    console.log("-".repeat(60));
    console.log(`   Total Orders:      ${totalOrders}`);
    console.log(`   ⏳ Pending:         ${pendingOrders} (waiting for payment)`);
    console.log(`   🔄 Submitted:       ${submittedOrders} (awaiting verification)`);
    console.log(`   ✅ Verified:        ${verifiedOrders} (completed)`);
    console.log(`   ⏰ Expired:         ${expiredOrders} (not completed in time)`);
    console.log(`   ❌ Failed:          ${failedOrders} (rejected)`);
    console.log();

    // Active orders (blocking sequences)
    const activeOrders = pendingOrders + submittedOrders;
    const availableSequences = 99 - activeOrders;

    console.log("🔢 SEQUENCE AVAILABILITY");
    console.log("-".repeat(60));
    console.log(`   Active Orders:     ${activeOrders} (pending + submitted)`);
    console.log(`   Max Sequences:     99 per plan type`);
    console.log(`   Available:         ${availableSequences} sequences free`);
    console.log();

    // By plan type
    const planTypes = ["test", "monthly", "yearly", "lifetime"];
    
    console.log("📋 ORDERS BY PLAN TYPE");
    console.log("-".repeat(60));

    for (const planType of planTypes) {
      const active = await Order.countDocuments({
        planType,
        status: { $in: ["pending", "submitted"] }
      });
      const total = await Order.countDocuments({ planType });
      const verified = await Order.countDocuments({ planType, status: "verified" });
      const expired = await Order.countDocuments({ planType, status: "expired" });

      console.log(`\n   ${planType.toUpperCase()}`);
      console.log(`   ├─ Total:          ${total}`);
      console.log(`   ├─ Active:         ${active} (sequences in use)`);
      console.log(`   ├─ Available:      ${99 - active} sequences free`);
      console.log(`   ├─ Verified:       ${verified}`);
      console.log(`   └─ Expired:        ${expired}`);
    }
    console.log();

    // Recent orders
    console.log("🕐 RECENT ORDERS (Last 5)");
    console.log("-".repeat(60));

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "username")
      .lean();

    if (recentOrders.length === 0) {
      console.log("   No orders found");
    } else {
      recentOrders.forEach((order, index) => {
        const statusEmoji = {
          pending: "⏳",
          submitted: "🔄",
          verified: "✅",
          expired: "⏰",
          failed: "❌"
        }[order.status];

        console.log(`\n   ${index + 1}. ${statusEmoji} ${order.status.toUpperCase()}`);
        console.log(`      User:      ${order.userId?.username || "Unknown"}`);
        console.log(`      Plan:      ${order.planType}`);
        console.log(`      Amount:    ₹${order.uniqueAmount} (sequence: ${order.paiseSequence})`);
        console.log(`      Created:   ${new Date(order.createdAt).toLocaleString()}`);
        console.log(`      Expires:   ${new Date(order.expiresAt).toLocaleString()}`);
      });
    }
    console.log();

    // Orders expiring soon (next 10 minutes)
    const expiringSoon = await Order.countDocuments({
      status: { $in: ["pending", "submitted"] },
      expiresAt: {
        $lt: new Date(Date.now() + 10 * 60 * 1000),
        $gt: new Date()
      }
    });

    if (expiringSoon > 0) {
      console.log("⚠️  WARNING");
      console.log("-".repeat(60));
      console.log(`   ${expiringSoon} orders expiring in the next 10 minutes!`);
      console.log();
    }

    // Cleanup recommendations
    const oldExpired = await Order.countDocuments({
      status: "expired",
      expiresAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (oldExpired > 0) {
      console.log("💡 RECOMMENDATIONS");
      console.log("-".repeat(60));
      console.log(`   ${oldExpired} expired orders older than 7 days found`);
      console.log(`   Run: node scripts/cleanup-orders.js 7`);
      console.log(`   This will free up database space`);
      console.log();
    }

    console.log("=" .repeat(60));
    console.log("✅ Report generated successfully!");
    console.log("=" .repeat(60));
    console.log();

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Check failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run check
checkOrdersStatus();
