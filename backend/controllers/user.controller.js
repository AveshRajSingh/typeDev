import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
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
      ).catch(err => console.error("Welcome email failed:", err));
    }

    // ✅ Create OTP after we have user._id
    await Otp.create({
      userId: user._id,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // ✅ Send OTP email
    await sendMail(
      user.email,
      "OTP VERIFICATION",
      `Hello ${user.username},\n\nYour OTP is: ${otpCode}`
    );

    const userToBeSent = await User.findById(user._id).select("-password -refreshToken");
    return res.status(existingUser ? 200 : 201).json({
      message: "OTP sent to your email for verification",
      user: userToBeSent,
    });
  } catch (error) {
    console.error("createUser error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;
    
    const user = await User.findOne({ username });
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

export { createUser, verifyOtp };
