#!/usr/bin/env node

/**
 * Payment System Startup Test Script
 * Verifies all components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Payment System Configuration Check\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Helper functions
const checkFile = (filepath, label) => {
  if (fs.existsSync(filepath)) {
    console.log(`✅ ${label}`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${label} - File not found: ${filepath}`);
    checks.failed++;
    return false;
  }
};

const checkDir = (dirpath, label) => {
  if (fs.existsSync(dirpath) && fs.statSync(dirpath).isDirectory()) {
    console.log(`✅ ${label}`);
    checks.passed++;
    return true;
  } else {
    console.log(`❌ ${label} - Directory not found: ${dirpath}`);
    checks.failed++;
    return false;
  }
};

const checkEnvVar = (varName) => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
    checks.passed++;
    return true;
  } else {
    console.log(`⚠️  ${varName} is not set`);
    checks.warnings++;
    return false;
  }
};

// Check backend files
console.log('📦 Backend Models:');
checkFile(path.join(__dirname, 'models/order.model.js'), 'Order Model');
checkFile(path.join(__dirname, 'models/transaction.model.js'), 'Transaction Model');
checkFile(path.join(__dirname, 'models/notification.model.js'), 'Notification Model');

console.log('\n🎛️  Backend Controllers:');
checkFile(path.join(__dirname, 'controllers/payment.controller.js'), 'Payment Controller');

console.log('\n🛣️  Backend Routes:');
checkFile(path.join(__dirname, 'routes/payment.route.js'), 'Payment Routes');

console.log('\n🔧 Backend Utilities:');
checkFile(path.join(__dirname, 'utility/payment.utility.js'), 'Payment Utility');
checkFile(path.join(__dirname, 'utility/notification.utility.js'), 'Notification Utility');

console.log('\n🛡️  Backend Middleware:');
checkFile(path.join(__dirname, 'middlewares/admin.middleware.js'), 'Admin Middleware');

console.log('\n✅ Backend Validations:');
checkFile(path.join(__dirname, 'validations/validation.js'), 'Validation Schemas');

console.log('\n📁 Upload Directories:');
checkDir(path.join(__dirname, 'uploads/payment-screenshots'), 'Payment Screenshots Directory');
checkDir(path.join(__dirname, 'uploads/reconciliation'), 'Reconciliation Directory');

console.log('\n📦 Package Dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredPackages = [
    'qrcode',
    'csv-parser',
    'node-cron',
    'node-telegram-bot-api',
    'multer',
    'papaparse'
  ];
  
  requiredPackages.forEach(pkg => {
    if (packageJson.dependencies[pkg]) {
      console.log(`✅ ${pkg} installed`);
      checks.passed++;
    } else {
      console.log(`❌ ${pkg} not installed`);
      checks.failed++;
    }
  });
} catch (err) {
  console.log(`❌ Could not read package.json`);
  checks.failed++;
}

console.log('\n🔐 Environment Variables:');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('✅ .env file exists');
  checks.passed++;
  
  // Load and check env vars
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const hasMongoUrl = envContent.includes('MONGODB_URL=') && !envContent.includes('MONGODB_URL=mongodb://localhost');
  const hasEmailUser = envContent.includes('EMAIL_USER=') && !envContent.includes('EMAIL_USER=your');
  const hasJWTSecret = envContent.includes('ACCESS_TOKEN_SECRET=') && !envContent.includes('ACCESS_TOKEN_SECRET=your');
  
  if (hasMongoUrl) {
    console.log('✅ MONGODB_URL configured');
    checks.passed++;
  } else {
    console.log('⚠️  MONGODB_URL not configured or using default');
    checks.warnings++;
  }
  
  if (hasEmailUser) {
    console.log('✅ EMAIL_USER configured');
    checks.passed++;
  } else {
    console.log('⚠️  EMAIL_USER not configured');
    checks.warnings++;
  }
  
  if (hasJWTSecret) {
    console.log('✅ JWT secrets configured');
    checks.passed++;
  } else {
    console.log('⚠️  JWT secrets not configured');
    checks.warnings++;
  }
  
  if (envContent.includes('TELEGRAM_BOT_TOKEN=') && !envContent.includes('TELEGRAM_BOT_TOKEN=your')) {
    console.log('✅ Telegram bot configured');
    checks.passed++;
  } else {
    console.log('⚠️  Telegram bot not configured (optional)');
    checks.warnings++;
  }
} else {
  console.log('❌ .env file not found - Please copy .env.example to .env');
  checks.failed++;
}

console.log('\n📋 Summary:');
console.log(`✅ Passed: ${checks.passed}`);
if (checks.warnings > 0) console.log(`⚠️  Warnings: ${checks.warnings}`);
if (checks.failed > 0) console.log(`❌ Failed: ${checks.failed}`);

if (checks.failed === 0) {
  console.log('\n🎉 All critical components are in place!');
  console.log('\n📝 Next Steps:');
  console.log('1. Configure .env file (if warnings shown)');
  console.log('2. Set an admin user in MongoDB: db.users.updateOne({email: "your@email.com"}, {$set: {isAdmin: true}})');
  console.log('3. Start the server: npm start');
  console.log('4. Visit http://localhost:5000 to test');
  console.log('\n📖 See IMPLEMENTATION_GUIDE.md for detailed setup instructions');
  process.exit(0);
} else {
  console.log('\n❌ Some components are missing. Please check the errors above.');
  process.exit(1);
}
