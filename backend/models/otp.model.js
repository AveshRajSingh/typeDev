import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  otp: {
    type: String, // stored as hashed string
    required: true,
  },
  expiresAt: {
    type: Date,
    default: Date.now, // function reference, not executed immediately
  },
  resendCount: {
    type: Number,
    default: 0,
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
  attempts: {
    type: Number,
    default: 0,
  },
});

// 🔒 Hash OTP before saving
otpSchema.pre("save", async function (next) {
  if (this.isModified("otp")) {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp.toString(), salt);
  }
  next();
});

// 🧩 Static method to generate OTP

// ✅ Instance method to validate OTP
otpSchema.methods.isOtpValid = async function (enteredOtp) {
  if (this.expiresAt < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  if (this.attempts >= 5) {
    return { valid: false, reason: "too_many_attempts" };
  }

  this.attempts += 1;
  await this.save();

  const isMatch = await bcrypt.compare(enteredOtp.toString(), this.otp);
  if (!isMatch) {
    return { valid: false, reason: "invalid_otp" };
  }

  return { valid: true };
};

// ⏰ Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);
export { Otp };
