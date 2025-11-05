import express from "express";
import { Router } from "express";
import {
  createUser,
  verifyOtp,
  resendOtp,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createUserSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validations/validation.js";
const router = Router();

router.post("/create-user", validate(createUserSchema), createUser);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);

export default router;
