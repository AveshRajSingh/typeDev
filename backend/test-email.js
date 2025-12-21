import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { sendMail, verifyConnection } from "./utility/transportar.utility.js";

const testEmail = async () => {
  console.log("=".repeat(50));
  console.log("📧 SMTP Configuration Test");
  console.log("=".repeat(50));
  
  console.log("\n📋 Current Configuration:");
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   Pass: ${"*".repeat(process.env.EMAIL_PASS?.length || 0)}`);
  
  console.log("\n🔍 Step 1: Verifying SMTP Connection...");
  const isConnected = await verifyConnection();
  
  if (!isConnected) {
    console.log("\n❌ Connection verification failed!");
    console.log("\n💡 Troubleshooting Tips:");
    console.log("   1. Check if EMAIL credentials are correct in .env");
    console.log("   2. For Gmail, ensure you're using an App Password (not regular password)");
    console.log("   3. Try switching to port 465 (SSL) instead of 587 (TLS)");
    console.log("   4. Consider using SendGrid, Mailgun, or AWS SES for production");
    console.log("\n📖 See SMTP_CONFIGURATION_GUIDE.md for detailed instructions");
    process.exit(1);
  }
  
  console.log("\n📤 Step 2: Sending Test Email...");
  // For Resend, use ADMIN_EMAIL or a valid test email
  const testRecipient = process.env.ADMIN_EMAIL || "test@example.com";
  
  try {
    await sendMail(
      testRecipient,
      "TypeDev SMTP Test",
      `This is a test email from TypeDev.\n\nIf you receive this, your SMTP configuration is working correctly!\n\nTimestamp: ${new Date().toISOString()}`
    );
    
    console.log("\n✅ Test email sent successfully!");
    console.log(`   Check inbox at: ${testRecipient}`);
    console.log("\n🎉 SMTP configuration is working properly!");
    
  } catch (error) {
    console.error("\n❌ Failed to send test email:");
    console.error(`   Error: ${error.message}`);
    console.log("\n💡 Check SMTP_CONFIGURATION_GUIDE.md for solutions");
    process.exit(1);
  }
  
  console.log("\n" + "=".repeat(50));
  process.exit(0);
};

testEmail().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
