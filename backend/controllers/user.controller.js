import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
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
      message =
        "Failed to send OTP email. Please try again later. or request a new OTP.";
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
    user.freeFeedbackLeft = 20; // Logged-in users get 20 free feedbacks
    await user.save();
    await Otp.deleteMany({ userId: user._id });
    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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
        $or: [
          { lastSentAt: { $lte: dateThreshold } },
          { lastSentAt: { $exists: false } },
        ],
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
    const nextAllowed = new Date(
      existing.lastSentAt.getTime() + RESEND_COOLDOWN_MS
    );
    const waitSeconds = Math.ceil((nextAllowed - Date.now()) / 1000);
    return res
      .status(429)
      .json({
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      });
  } catch (error) {
    console.error("resendOtp error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required",
      });
    }

    // Find user by either email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please check your credentials.",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
      });
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-origin in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Get user without sensitive data
    const userToBeSent = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Set cookies and send response
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes for access token
      })
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        message: "Login successful",
        user: userToBeSent,
        accessToken, // Also send in response for clients that prefer token storage
      });
  } catch (error) {
    console.error("loginUser error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by verifyJWT middleware
    return res.status(200).json({
      message: "User fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    // Find user by username and exclude sensitive information
    const user = await User.findOne({ username }).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Set cache headers for profile data
    res.set({
      "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      ETag: `"profile-${username}-${user.updatedAt.getTime()}"`,
      Vary: "Cookie",
    });

    // Return user profile with statistics
    return res.status(200).json({
      message: "Profile fetched successfully",
      username: user.username,
      email: user.email,
      testsTaken: user.testsTaken,
      avgWPM: user.avgWPM,
      bestWPM: user.bestWPM,
      avgAccuracy: user.avgAccuracy,
      bestAccuracy: user.bestAccuracy || 0,
      testsCompleted: user.testsCompleted,
      isPremium: user.isPremium,
      isEmailVerified: user.isEmailVerified,
      freeFeedbackLeft: user.freeFeedbackLeft,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const incrementTestsTaken = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and increment testsTaken
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { testsTaken: 1 } },
      { new: true, select: "testsTaken" }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Test started",
      testsTaken: user.testsTaken,
    });
  } catch (error) {
    console.error("incrementTestsTaken error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const saveTestResult = async (req, res) => {
  try {
    // Only take what you actually use
    const { wpm, accuracy } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousCompleted = user.testsCompleted || 0;
    const newCompletedCount = previousCompleted + 1;

    // Safe defaults in case fields are undefined/null
    const prevAvgWPM = user.avgWPM || 0;
    const prevAvgAccuracy = user.avgAccuracy || 0;

    const newAvgWPM =
      (prevAvgWPM * previousCompleted + wpm) / newCompletedCount;
    const newAvgAccuracy =
      (prevAvgAccuracy * previousCompleted + accuracy) / newCompletedCount;

    const newBestWPM = Math.max(user.bestWPM || 0, wpm);
    const newBestAccuracy = Math.max(user.bestAccuracy || 0, accuracy);

    user.testsCompleted = newCompletedCount;
    user.avgWPM = Math.round(newAvgWPM * 100) / 100;
    user.avgAccuracy = Math.round(newAvgAccuracy * 100) / 100;
    user.bestWPM = newBestWPM;
    user.bestAccuracy = newBestAccuracy;

    await user.save();

    return res.status(200).json({
      message: "Test result saved successfully",
      stats: {
        testsTaken: user.testsTaken,
        testsCompleted: user.testsCompleted,
        avgWPM: user.avgWPM,
        avgAccuracy: user.avgAccuracy,
        bestWPM: user.bestWPM,
        bestAccuracy: user.bestAccuracy,
      },
    });
  } catch (error) {
    console.error("saveTestResult error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Clear refresh token in database
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }

    // Cookie options for clearing
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    // Clear cookies and send response
    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({
        message: "Logged out successfully",
      });
  } catch (error) {
    console.error("logoutUser error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  createUser,
  verifyOtp,
  resendOtp,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserProfile,
  incrementTestsTaken,
  saveTestResult,
};
