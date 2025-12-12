# ⚡ TypeDev - Typing Speed Test Application

A modern, full-stack typing speed test application with premium features, payment integration, and admin dashboard.

## 🎯 Features

### User Features
- **Typing Speed Test**: Test your typing speed with various difficulty levels
- **AI-Generated Paragraphs**: Custom paragraphs based on your preferences
- **User Profiles**: Track your progress and statistics
- **Offline Support**: Continue using the app without internet
- **Multiple Themes**: Light, Dark, Ocean, Purple, Slate, Midnight, Nord
- **Special Characters**: Practice with punctuation and symbols
- **Real-time Feedback**: See WPM, accuracy, and errors as you type

### Premium Features
- **Unlimited AI Feedback**: Get detailed feedback on your typing
- **Extended Paragraph Generation**: Generate custom practice paragraphs
- **Advanced Statistics**: Deep dive into your typing patterns
- **Ad-Free Experience**: Clean, distraction-free interface

### Admin Features
- **Payment Management**: Verify and manage user payments
- **Order Tracking**: Monitor all payment orders
- **CSV Reconciliation**: Bulk verify payments from bank statements
- **Notifications**: Email and Telegram alerts for new payments
- **User Management**: View and manage user accounts

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - API server
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Nodemailer** - Email notifications
- **Telegram Bot** - Admin notifications
- **Multer** - File uploads
- **QRCode** - Payment QR generation
- **Node-Cron** - Scheduled tasks
- **Bcrypt** - Password hashing

### Frontend
- **Next.js 16** - React framework
- **Tailwind CSS 4** - Styling
- **Axios** - API calls
- **Service Workers** - Offline support
- **Local Storage** - Caching

## 📁 Project Structure

```
typeDev/
├── backend/                 # Node.js API Server
│   ├── controllers/         # Route handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── middlewares/        # Auth, validation, admin
│   ├── utility/            # Helper functions
│   ├── validations/        # Input validation schemas
│   ├── scripts/            # Maintenance scripts
│   ├── uploads/            # File uploads
│   ├── app.js              # Server entry point
│   └── .env.example        # Environment template
│
├── frontend/               # Next.js App
│   ├── app/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── admin/         # Admin dashboard
│   │   ├── auth/          # Authentication
│   │   ├── profile/       # User profiles
│   │   └── premium/       # Premium features
│   ├── public/            # Static files
│   └── .env.example       # Environment template
│
└── Documentation/          # Production guides
    ├── PRODUCTION_DEPLOYMENT.md
    ├── SECURITY_AUDIT.md
    └── PRODUCTION_READINESS.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MongoDB** (Local or Atlas)
- **Gmail Account** (for emails)

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.production.example .env
   nano .env
   ```

   Minimal configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_connection_string
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ACCESS_TOKEN_SECRET=your-secret-here
   REFRESH_TOKEN_SECRET=your-secret-here
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

   Server runs at: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   App runs at: `http://localhost:3000`

### Create Admin User

```bash
cd backend
node scripts/set-admin.js your-username
```

## 🎮 Usage

### For Users

1. **Homepage**: `http://localhost:3000`
2. **Sign Up**: Create an account
3. **Take a Test**: Select time limit, difficulty, and start typing
4. **View Results**: See your WPM, accuracy, and error analysis
5. **Profile**: Track your progress over time
6. **Get Premium**: Subscribe for unlimited features

### For Admins

1. **Login** as admin user
2. **Click Admin Button** (🛡️) in top-right corner
3. **Manage Payments**:
   - View pending orders
   - Approve/reject payments
   - Upload bank CSV for bulk verification

## 📚 Documentation

Comprehensive guides available:

- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)**: Complete deployment guide
  - VPS deployment (DigitalOcean, AWS)
  - Heroku deployment
  - Vercel/Netlify deployment
  - SSL setup
  - Monitoring setup

- **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)**: Security analysis
  - Security issues fixed
  - Best practices implemented
  - Additional recommendations
  - Security testing procedures

- **[PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)**: Summary
  - Changes made
  - Files modified
  - Action required checklist
  - Testing procedures

## 🔐 Security

### Implemented Security Features

✅ **Authentication**: JWT with refresh tokens  
✅ **Authorization**: Role-based access control (admin/user)  
✅ **Password Security**: Bcrypt hashing with 10 rounds  
✅ **Input Validation**: Yup schemas on all endpoints  
✅ **File Upload Security**: Size limits, type restrictions  
✅ **CORS**: Environment-based origin whitelist  
✅ **Error Handling**: No sensitive data in responses  
✅ **Database**: Mongoose schema validation  

### Security Score: 8.5/10

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for details and recommendations.

## 🔧 API Endpoints

### Public Endpoints
```
POST /users/signup          - User registration
POST /users/login           - User login
POST /users/verify-otp      - Email verification
GET  /para/genpara          - Get paragraph
GET  /health                - Health check
```

### Authenticated Endpoints
```
GET  /users/current         - Get current user
POST /para/updateStats      - Update typing stats
POST /ai/feedback           - Get AI feedback
POST /payment/create-order  - Create payment order
POST /payment/submit-transaction - Submit payment
```

### Admin Endpoints
```
GET  /payment/pending-orders - View pending payments
PATCH /payment/verify/:id   - Verify payment
POST /payment/reconcile     - Bulk verify from CSV
```

## 💾 Database Scripts

### Check Orders Status
```bash
cd backend
npm run check-orders
```

Shows:
- Active vs expired orders
- Sequence availability
- Recent orders
- Cleanup recommendations

### Cleanup Old Orders
```bash
npm run cleanup-orders 7  # Delete expired orders older than 7 days
```

### Set Admin User
```bash
node scripts/set-admin.js username
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-12T...",
  "uptime": 123.45,
  "environment": "development",
  "mongodb": "connected"
}
```

### Cron Jobs

Automated tasks running in background:

1. **Premium Expiry Check**: Daily at midnight
   - Deactivates expired premium subscriptions

2. **Order Expiry Check**: Every 5 minutes
   - Marks expired orders as expired
   - Frees up paise sequences

## 🐛 Troubleshooting

### Backend Won't Start

**Issue**: MongoDB connection failed  
**Solution**: Check `MONGO_URI` in `.env`, verify MongoDB is running

**Issue**: Port already in use  
**Solution**: Change `PORT` in `.env` or kill process on port 5000

### Frontend Can't Connect to API

**Issue**: CORS error  
**Solution**: Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

**Issue**: API calls failing  
**Solution**: Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Emails Not Sending

**Issue**: Authentication failed  
**Solution**: Use Gmail App Password, not regular password  
**Steps**: 
1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `EMAIL_PASS`

### Admin Can't Access Dashboard

**Issue**: Redirected to homepage  
**Solution**: Set user as admin
```bash
node scripts/set-admin.js username
```

## 🚀 Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for comprehensive deployment guide.

### Quick Deploy Checklist

- [ ] Generate strong JWT secrets
- [ ] Configure production MongoDB
- [ ] Setup Gmail App Password
- [ ] Update `FRONTEND_URL` and `CORS_ORIGIN`
- [ ] Set `NODE_ENV=production`
- [ ] Test health endpoint
- [ ] Create admin user
- [ ] Test payment flow
- [ ] Setup SSL/HTTPS
- [ ] Configure monitoring

## 📝 Environment Variables

### Backend Required
```env
MONGO_URI              # MongoDB connection string
ACCESS_TOKEN_SECRET    # JWT access token secret
REFRESH_TOKEN_SECRET   # JWT refresh token secret
EMAIL_USER             # Gmail address
EMAIL_PASS             # Gmail App Password
FRONTEND_URL           # Frontend URL for CORS
```

### Frontend Required
```env
NEXT_PUBLIC_API_URL    # Backend API URL
```

See `.env.production.example` files for complete list.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is private and confidential.

## 👥 Support

For issues or questions:
- Check [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)
- Review [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)
- Check troubleshooting section above

## 🎯 Production Status

✅ **Ready for Production**

- All critical issues fixed
- Comprehensive documentation
- Security audit completed
- Error handling implemented
- Health check endpoint added
- Cron jobs configured
- Admin dashboard functional

**Next Steps**:
1. Review documentation
2. Configure production environment
3. Deploy following deployment guide
4. Setup monitoring
5. Test thoroughly

---

**Version**: 1.0.0  
**Last Updated**: December 12, 2025  
**Status**: ✅ Production Ready
