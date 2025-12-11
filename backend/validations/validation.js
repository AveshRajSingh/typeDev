import * as yup from "yup";

export const createUserSchema = yup.object({
  username: yup
    .string()
    .trim()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username cannot exceed 30 characters")
    .matches(/^\S*$/, "Username cannot contain spaces"), 
  email: yup
    .string()
    .trim()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .trim()
});


export const verifyOtpSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .trim(),
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d{6}$/, "OTP must be a 6-digit number")
});


export const resendOtpSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .trim(),
});

export const loginUserSchema = yup.object({
  identifier: yup
    .string()
    .required("Email or Username is required")
    .trim(),
  password: yup
    .string()
    .required("Password is required")
    .trim()
});

export const saveTestResultSchema = yup.object({
  wpm: yup
    .number()
    .required("WPM is required")
    .min(0, "WPM must be a positive number"),
  accuracy: yup
    .number()
    .required("Accuracy is required")
    .min(0, "Accuracy must be at least 0")
    .max(100, "Accuracy cannot exceed 100"),
  rawWPM: yup
    .number()
    .required("Raw WPM is required")
    .min(0, "Raw WPM must be a positive number"),
  correctChars: yup
    .number()
    .required("Correct characters count is required")
    .min(0, "Correct characters must be a positive number"),
  wrongChars: yup
    .number()
    .required("Wrong characters count is required")
    .min(0, "Wrong characters must be a positive number"),
  timeInSeconds: yup
    .number()
    .required("Time in seconds is required")
    .min(1, "Time must be at least 1 second"),
});

// Payment validation schemas
export const createOrderSchema = yup.object({
  planType: yup
    .string()
    .required("Plan type is required")
    .oneOf(["monthly", "yearly", "lifetime"], "Invalid plan type")
});

export const submitTransactionSchema = yup.object({
  orderId: yup
    .string()
    .required("Order ID is required")
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid order ID format"),
  upiTransactionId: yup
    .string()
    .required("UPI transaction ID is required")
    .matches(/^\d{12}$/, "UPI transaction ID must be 12 digits")
    .trim()
});

export const verifyOrderSchema = yup.object({
  action: yup
    .string()
    .required("Action is required")
    .oneOf(["approve", "reject"], "Action must be 'approve' or 'reject'"),
  notes: yup
    .string()
    .optional()
    .max(500, "Notes cannot exceed 500 characters")
});
