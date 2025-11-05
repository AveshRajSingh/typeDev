import express from "express";
import { Router } from "express";
import { createUser,verifyOtp } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createUserSchema,verifyOtpSchema } from "../validations/validation.js";
const router = Router();

router.post("/create-user", validate(createUserSchema), createUser);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

export default router;