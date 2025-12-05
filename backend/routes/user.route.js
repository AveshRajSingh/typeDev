import express from "express";
import { Router } from "express";
import {
  createUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getCurrentUser,
  getUserProfile,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginUserSchema,
} from "../validations/validation.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.post("/create-user", validate(createUserSchema), createUser);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/login", validate(loginUserSchema), loginUser);

// Protected routes
router.get("/me", verifyJWT, getCurrentUser);

// Public profile route
router.get("/profile/:username", getUserProfile);

export default router;
