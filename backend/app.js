import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';
import { connectDb } from './db/index.js';
import { deactivateExpiredPremiums, markExpiredOrders } from './utility/payment.utility.js';

const app = express();

// CORS configuration for credentials
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


import userRouter from './routes/user.route.js';
app.use("/users", userRouter);

import paraRouter from './routes/para.route.js';
app.use("/para", paraRouter);

import aiRouter from './routes/ai.route.js';
app.use("/ai", aiRouter);

import paymentRouter from './routes/payment.route.js';
app.use("/payment", paymentRouter);

// Serve static files for uploaded screenshots
app.use('/uploads', express.static('uploads'));

// Cron jobs for payment system
// Run every day at midnight to check expired premiums
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily premium expiry check...');
  try {
    await deactivateExpiredPremiums();
  } catch (error) {
    console.error('Premium expiry check failed:', error);
  }
});

// Run every 5 minutes to mark expired orders
cron.schedule('*/5 * * * *', async () => {
  console.log('Running order expiry check...');
  try {
    await markExpiredOrders();
  } catch (error) {
    console.error('Order expiry check failed:', error);
  }
});

connectDb().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
}).catch((error) => {
  console.error("Failed to start server due to database connection error:", error.message);
  process.exit(1);
});
