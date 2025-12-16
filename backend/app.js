import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { connectDb } from './db/index.js';
import { deactivateExpiredPremiums, markExpiredOrders } from './utility/payment.utility.js';

const app = express();

// Trust proxy - Required for platforms like Render, Heroku, etc.
// This allows Express to trust the X-Forwarded-* headers
app.set('trust proxy', 1);

// Environment variables validation
const requiredEnvVars = ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Security middleware - Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
}));

// Rate limiting - Protect against brute force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 login/signup attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/users/login', authLimiter);
app.use('/users/create-user', authLimiter);
app.use('/users/verify-otp', authLimiter);
app.use(limiter); // Apply to all other routes

// Determine allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || process.env.CORS_ORIGIN]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

console.log('🌐 CORS Configuration:', {
  environment: process.env.NODE_ENV,
  allowedOrigins: allowedOrigins
});

// CORS configuration for credentials
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel preview and production deployments
    if (origin.endsWith('.vercel.app')) {
      console.log('✅ CORS allowed Vercel deployment:', origin);
      return callback(null, true);
    }
    
    // Check if origin is in allowed origins
    if (allowedOrigins.some(allowed => allowed && (origin === allowed || origin.startsWith(allowed)))) {
      console.log('✅ CORS allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'connected' // Will be 'connected' if server is running
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'TypeDev API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      users: '/users',
      paragraphs: '/para',
      ai: '/ai',
      payment: '/payment',
      health: '/health'
    }
  });
});

// Cron jobs for payment system
// Run every day at midnight to check expired premiums
cron.schedule('0 0 * * *', async () => {
  try {
    await deactivateExpiredPremiums();
  } catch (error) {
    console.error('Premium expiry check failed:', error);
  }
});

// Run every 5 minutes to mark expired orders
cron.schedule('*/5 * * * *', async () => {

  try {
    await markExpiredOrders();
  } catch (error) {
    console.error('Order expiry check failed:', error);
  }
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Token expired'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    process.exit(0);
  });
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit the process
  // process.exit(1);
});

// Start server
let server;
connectDb().then(() => {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT);
}).catch((error) => {
  console.error("❌ Failed to start server due to database connection error:", error.message);
  process.exit(1);
});
