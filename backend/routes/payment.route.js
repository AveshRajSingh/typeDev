import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import {
  createOrder,
  submitTransaction,
  getPendingOrders,
  manualVerifyOrder,
  reconcilePayments,
  getMyOrders,
  getOrderStatus,
  getNotifications,
  markNotificationRead
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  submitTransactionSchema,
  verifyOrderSchema
} from "../validations/validation.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for payment screenshot uploads
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/payment-screenshots"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const screenshotUpload = multer({
  storage: screenshotStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed"));
    }
  }
});

// Configure multer for CSV reconciliation uploads
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/reconciliation"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `bank-statement-${uniqueSuffix}.csv`);
  }
});

const csvUpload = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || path.extname(file.originalname).toLowerCase() === ".csv") {
      return cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  }
});

// User routes (protected by JWT)
router.post("/create-order", verifyJWT, validate(createOrderSchema), createOrder);
router.post("/submit-transaction", verifyJWT, screenshotUpload.single("screenshot"), validate(submitTransactionSchema), submitTransaction);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/order-status/:orderId", verifyJWT, getOrderStatus);

// Admin routes (protected by JWT + Admin check)
router.get("/pending-orders", verifyJWT, verifyAdmin, getPendingOrders);
router.patch("/verify/:orderId", verifyJWT, verifyAdmin, validate(verifyOrderSchema), manualVerifyOrder);
router.post("/reconcile", verifyJWT, verifyAdmin, csvUpload.single("csvFile"), reconcilePayments);
router.get("/notifications", verifyJWT, verifyAdmin, getNotifications);
router.patch("/notifications/:notificationId/read", verifyJWT, verifyAdmin, markNotificationRead);

export default router;
