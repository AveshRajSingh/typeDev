import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import bcrypt from "bcrypt";
import {
  generateRefreshToken,
  generateOtp,
} from "../utility/generateToken.utility.js";
import { sendMail } from "../utility/transportar.utility.js";
const createUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    const otpCode = generateOtp();

    let user;

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: "You can login" });
      }

      existingUser.password = password;
      existingUser.username = username;
      existingUser.refreshToken = generateRefreshToken(existingUser);
      await existingUser.save();
      user = existingUser;
    } else {
      const newUser = await User.create({ email, password, username });
      newUser.refreshToken = generateRefreshToken(newUser);
      await newUser.save();
      user = newUser;

      // send welcome email (non-blocking)
      sendMail(
        user.email,
        "Welcome to TypeDev!",
        `Hello ${user.username},\n\nThank you for registering at TypeDev!`
      ).catch((err) => console.error("Welcome email failed:", err));
    }

    // ✅ Create OTP after we have user._id
    await Otp.create({
      userId: user._id,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // ✅ Send OTP email
    let message = "OTP sent to your email for verification";
    try {
      await sendMail(
        user.email,
        "OTP VERIFICATION",
        `Hello ${user.username},\n\nYour OTP is: ${otpCode}`
      );
    } catch (error) {
      console.error("Failed to send OTP email:", error.message);
      message = "Failed to send OTP email. Please try again later. or request a new OTP.";
    }

    const userToBeSent = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    return res.status(existingUser ? 200 : 201).json({
      message,
      user: userToBeSent,
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ message: "OTP not found. Please request a new one." });
    }
    const { valid, reason } = await otpRecord.isOtpValid(otp);
    if (!valid) {
      if (reason === "expired") {
        return res
          .status(400)
          .json({ message: "OTP has expired. Please request a new one." });
      } else {
        return res
          .status(400)
          .json({ message: "Invalid OTP. Please try again." });
      }
    }
    user.isEmailVerified = true;
    await user.save();
    await Otp.deleteMany({ userId: user._id });
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend OTP controller
// - Accepts { username }
// - Enforces a cooldown and a max resend limit
// - Updates the existing OTP record atomically (hashing the OTP before update)
// - If no OTP record exists, creates a new one
const resendOtp = async (req, res) => {
  try {
    const { username } = req.body;
    const MAX_RESEND = 3;
    const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otpCode = generateOtp();
    const dateThreshold = new Date(Date.now() - RESEND_COOLDOWN_MS);

    // Hash OTP before updating so we can use findOneAndUpdate (which doesn't trigger pre-save hooks)
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode.toString(), salt);

    // Try an atomic update: only update if resendCount < MAX_RESEND and lastSentAt is older than threshold (or doesn't exist)
    const updated = await Otp.findOneAndUpdate(
      {
        userId: user._id,
        resendCount: { $lt: MAX_RESEND },
        $or: [{ lastSentAt: { $lte: dateThreshold } }, { lastSentAt: { $exists: false } }],
      },
      {
        $inc: { resendCount: 1 },
        $set: {
          otp: hashedOtp,
          lastSentAt: new Date(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          attempts: 0,
        },
      },
      { new: true }
    );

    // If atomic update succeeded, send mail and return
    if (updated) {
      try {
        await sendMail(
          user.email,
          "OTP RESEND",
          `Hello ${user.username},\n\nYour new OTP is: ${otpCode}`
        );
      } catch (err) {
        console.error("Failed to send OTP email on resend:", err.message);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }

      return res.status(200).json({ message: "OTP resent to your email" });
    }

    // If atomic update didn't match, inspect why
    const existing = await Otp.findOne({ userId: user._id });
    if (!existing) {
      // No existing OTP record — create a new one (pre-save will hash)
      await Otp.create({
        userId: user._id,
        otp: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });
      try {
        await sendMail(
          user.email,
          "OTP VERIFICATION",
          `Hello ${user.username},\n\nYour OTP is: ${otpCode}`
        );
      } catch (err) {
        console.error("Failed to send OTP email on create:", err.message);
        return res.status(500).json({ message: "Failed to send OTP email" });
      }
      return res.status(201).json({ message: "OTP sent to your email" });
    }

    // If there is an existing record, check if we've exhausted resends
    if (existing.resendCount >= MAX_RESEND) {
      return res
        .status(429)
        .json({ message: "Resend limit reached. Please try again later." });
    }

    // Otherwise it's a cooldown issue — compute remaining time
    const nextAllowed = new Date(existing.lastSentAt.getTime() + RESEND_COOLDOWN_MS);
    const waitSeconds = Math.ceil((nextAllowed - Date.now()) / 1000);
    return res
      .status(429)
      .json({ message: `Please wait ${waitSeconds} seconds before requesting a new OTP.` });
  } catch (error) {
    console.error("resendOtp error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createUser, verifyOtp, resendOtp };
