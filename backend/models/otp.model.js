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
    required: true,
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

// 🧩 Static method to generate 

otpSchema.methods.isOtpValid = async function (enteredOtp) {
  if (this.expiresAt < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  // First check expiry (already done). Then compare the provided OTP.
  // Important: do NOT increment attempts before compare to avoid TOCTOU races.
  // If bcrypt.compare throws, let it propagate so attempts are not changed.
  const isMatch = await bcrypt.compare(enteredOtp.toString(), this.otp);
  if (isMatch) {
    return { valid: true };
  }

  // OTP is invalid — atomically increment attempts only if attempts < 5.
  // If the update returns null it means attempts already reached the limit.
  const updated = await this.constructor.findOneAndUpdate(
    { _id: this._id, attempts: { $lt: 5 } },
    { $inc: { attempts: 1 } },
    { new: true }
  );

  if (!updated) {
    // Couldn't increment because attempts already at/above limit
    return { valid: false, reason: "too_many_attempts" };
  }

  // Sync in-memory document's attempts for consistency (optional).
  this.attempts = updated.attempts;

  return { valid: false, reason: "invalid_otp" };
};

// ⏰ Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);
export { Otp };
