# SMTP Configuration Guide for TypeDev

## Current Issue
Getting `ETIMEDOUT` errors when sending emails through Gmail SMTP on Render or other cloud platforms.

## Solutions

### Option 1: Fix Gmail SMTP (Recommended for Development)

#### Steps:
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select "Mail" and your device
   - Copy the 16-character password (without spaces)
3. **Update .env**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Option 2: Use Alternative SMTP Services (Recommended for Production)

#### A. SendGrid (Free tier: 100 emails/day)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### B. Mailgun (Free tier: 5,000 emails/month)
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-smtp-password
```

#### C. AWS SES (Very cheap, highly reliable)
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASS=your-aws-smtp-password
```

#### D. Resend (Free tier: 3,000 emails/month, modern API)
```env
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASS=your-resend-api-key
```

### Option 3: For Render Deployment Specifically

Render might block certain SMTP ports. Try:

1. **Use port 465 with SSL**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

2. **Whitelist Render IPs in Gmail** (if using Gmail):
   - Check Render's outgoing IP addresses
   - Add them to Gmail's trusted sources

3. **Use Render's Environment Variables**:
   - Set environment variables in Render dashboard instead of .env file
   - Ensure they're properly loaded

## Testing SMTP Connection

After configuration, the server will automatically verify SMTP connection on startup. Look for:
```
✅ SMTP connection verified successfully
```

Or if it fails:
```
❌ SMTP connection verification failed: [error message]
```

## Troubleshooting

### Error: ETIMEDOUT
- **Cause**: Connection timeout (firewall/network issue)
- **Solution**: 
  - Switch to port 465
  - Use a different SMTP provider
  - Check Render's network restrictions

### Error: EAUTH
- **Cause**: Authentication failed
- **Solution**:
  - Verify credentials
  - Use App Password for Gmail (not regular password)
  - Check if 2FA is enabled

### Error: ESOCKET
- **Cause**: Socket connection error
- **Solution**:
  - Increase timeout values in transportar.utility.js
  - Try different SMTP port
  - Use SSL/TLS port 465

## Recommended Setup for Production

**Use SendGrid or AWS SES** - They are designed for transactional emails and have better deliverability than Gmail.

### Quick SendGrid Setup:
1. Sign up at sendgrid.com
2. Create an API key
3. Update .env:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=SG.your_api_key_here
   ```

### Quick Resend Setup (Recommended - Modern & Easy):
1. Sign up at resend.com
2. Add your domain or use their testing domain
3. Create an API key
4. Update .env:
   ```env
   EMAIL_HOST=smtp.resend.com
   EMAIL_PORT=587
   EMAIL_USER=resend
   EMAIL_PASS=re_your_api_key_here
   ```

## Current Configuration

The code has been updated with:
- ✅ Longer timeouts (10 seconds)
- ✅ TLS configuration for port 587
- ✅ Better error messages
- ✅ Connection verification on startup
- ✅ Debug logging in development

## Need Help?

If emails still don't work after trying these solutions:
1. Check Render logs for detailed error messages
2. Verify SMTP credentials are correct
3. Test SMTP connection using a tool like Mailtrap
4. Consider using a dedicated email service (SendGrid/Mailgun)
