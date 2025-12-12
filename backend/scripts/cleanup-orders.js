/**
 * Cleanup script for old expired payment orders
 * Run this script manually if you have too many expired orders
 * 
 * Usage: node scripts/cleanup-orders.js [days]
 * Example: node scripts/cleanup-orders.js 7  (deletes expired orders older than 7 days)
 */

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const DAYS_OLD = parseInt(process.argv[2]) || 7; // Default: 7 days

async function cleanupExpiredOrders() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_OLD);

    console.log(`🔍 Finding expired orders older than ${DAYS_OLD} days...`);
    console.log(`   Cutoff date: ${cutoffDate.toISOString()}\n`);

    // Find expired orders
    const expiredOrders = await Order.find({
      status: "expired",
      expiresAt: { $lt: cutoffDate }
    });

    console.log(`📊 Found ${expiredOrders.length} expired orders to delete\n`);

    if (expiredOrders.length === 0) {
      console.log("✨ No old expired orders found. Database is clean!");
      await mongoose.connection.close();
      process.exit(0);
    }

    // Show summary by plan type
    const summary = expiredOrders.reduce((acc, order) => {
      acc[order.planType] = (acc[order.planType] || 0) + 1;
      return acc;
    }, {});

    console.log("📋 Summary by plan type:");
    Object.entries(summary).forEach(([plan, count]) => {
      console.log(`   ${plan}: ${count} orders`);
    });
    console.log();

    // Delete orders
    const result = await Order.deleteMany({
      status: "expired",
      expiresAt: { $lt: cutoffDate }
    });

    console.log(`✅ Deleted ${result.deletedCount} expired orders`);
    console.log(`💾 ${result.deletedCount} paise sequences freed for reuse\n`);

    // Show current active orders count
    const activeCount = await Order.countDocuments({
      status: { $in: ["pending", "submitted"] }
    });

    console.log(`📊 Current active orders: ${activeCount}`);
    console.log(`   Available sequences per plan: ${99 - activeCount}\n`);

    console.log("🎉 Cleanup completed successfully!");
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run cleanup
cleanupExpiredOrders();
