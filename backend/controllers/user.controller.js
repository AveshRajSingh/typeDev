import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";
import { generateRefreshToken } from "../utility/generateToken.utility.js";
import { sendMail } from "../utility/transportar.utility.js";
const createUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, Username and Password are required" });
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Username already in use" });
    }
    if (email.trim().length === 0) {
      return res.status(400).json({ message: "Email cannot be empty" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (username.length < 3 || username.length > 30) {
      return res
        .status(400)
        .json({ message: "Username must be between 3 and 30 characters" });
    }
    if (username.trim().includes(" ")) {
      return res
        .status(400)
        .json({ message: "Username cannot contain spaces" });
    }
    if (username.trim().length === 0) {
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (password.trim().length === 0) {
      return res.status(400).json({ message: "Password cannot be empty" });
    }

    const newUser = await User.create({ email, password, username });
    const refToken = await generateRefreshToken(newUser);
    newUser.refreshToken = refToken;
    await newUser.save();
    const userToBeSent = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

   await sendMail(
      newUser.email,
      "Welcome to TypeDev!",
      `Hello ${newUser.username},\n\nThank you for registering at TypeDev! We're excited to have you on board.\n\nBest regards,\nThe TypeDev Team`
    );

    const otp = new Otp({
        otp: 
    });

    await sendMail(
        newUser.email,
        "OTP VARIFICATION",
        `Hello ${newUser.username},\n\nYour OTP for verification is: 123456\n\nBest regards,\nThe TypeDev Team`
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: userToBeSent });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
