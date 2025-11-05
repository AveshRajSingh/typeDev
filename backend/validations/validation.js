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
