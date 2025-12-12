/**
 * Check and update admin status for a user
 * Usage: node scripts/set-admin.js <username>
 * Example: node scripts/set-admin.js rishusingh
 */

import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const username = process.argv[2];

if (!username) {
  console.error("❌ Please provide a username");
  console.log("   Usage: node scripts/set-admin.js <username>");
  process.exit(1);
}

async function setAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    const user = await User.findOne({ username });

    if (!user) {
      console.error(`❌ User '${username}' not found`);
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log("👤 USER DETAILS");
    console.log("-".repeat(40));
    console.log(`   Username:      ${user.username}`);
    console.log(`   Email:         ${user.email}`);
    console.log(`   Is Admin:      ${user.isAdmin ? "✅ Yes" : "❌ No"}`);
    console.log(`   Is Premium:    ${user.isPremium ? "✅ Yes" : "❌ No"}`);
    if (user.isPremium && user.premiumExpiresAt) {
      console.log(`   Premium Until: ${new Date(user.premiumExpiresAt).toLocaleString()}`);
    }
    console.log();

    if (user.isAdmin) {
      console.log("ℹ️  User is already an admin!");
    } else {
      user.isAdmin = true;
      await user.save();
      console.log("✅ User promoted to admin!");
    }

    console.log();
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Operation failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

setAdmin();
