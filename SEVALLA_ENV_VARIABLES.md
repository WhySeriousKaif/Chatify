# 🔐 Complete List of Environment Variables for Sevalla

## ✅ **REQUIRED** - Must Set These

These are **critical** and the app won't work without them:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Connection (CRITICAL)
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify

# Authentication (CRITICAL)
JWT_SECRET=ChatifySecret

# Frontend URL (CRITICAL - Must match your production URL exactly)
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
```

## ⚠️ **IMPORTANT** - Set These for Full Functionality

These are needed for specific features:

```env
# Image/Video Upload (Required for image/video sharing)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🔵 **OPTIONAL** - Can Leave Empty or Skip

These are optional features - app will work without them:

```env
# Email Service (Optional - for welcome emails)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify

# Security/Rate Limiting (Optional - leave empty to disable)
ARCJET_KEY=
ARCJET_ENV=production

# Video Calling - ZegoCloud (Optional - for video calls)
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret
```

---

## 📋 **Complete Copy-Paste Template for Sevalla**

Copy this entire block and paste into your Sevalla environment variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify
JWT_SECRET=ChatifySecret
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📝 **Detailed Explanation**

### 🔴 **Required Variables**

| Variable | Purpose | Example | Notes |
|----------|---------|---------|-------|
| `NODE_ENV` | Environment mode | `production` | Tells app it's in production |
| `PORT` | Server port | `3000` | Port your server runs on |
| `MONGODB_URI` | Database connection | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Token signing key | `ChatifySecret` | Secret for JWT tokens (use strong secret in production) |
| `CLIENT_URL` | Frontend URL | `https://chatify-qnms0.sevalla.app` | Must match your production URL exactly |
| `FRONTEND_URL` | Frontend URL (same as CLIENT_URL) | `https://chatify-qnms0.sevalla.app` | Used for CORS and cookies |

### 🟡 **Important for Image/Video Upload**

| Variable | Purpose | Example |
|----------|---------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Your cloud name from Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your API key from Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your API secret from Cloudinary |

**Note:** Without these, users cannot upload images or videos.

### 🟢 **Optional Variables**

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `RESEND_API_KEY` | Email service for welcome emails | ❌ Optional |
| `EMAIL_FROM` | Sender email address | ❌ Optional |
| `EMAIL_FROM_NAME` | Sender name | ❌ Optional |
| `ARCJET_KEY` | Security/rate limiting | ❌ Optional (leave empty to disable) |
| `ARCJET_ENV` | Arcjet environment | ❌ Optional |
| `ZEGO_APP_ID` | Video calling service | ❌ Optional |
| `ZEGO_SERVER_SECRET` | Video calling secret | ❌ Optional |

---

## 🎯 **Minimum Required Setup**

If you want to deploy with **minimum required variables** only:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify
JWT_SECRET=ChatifySecret
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
```

This will allow:
- ✅ User signup/login
- ✅ Messaging (text only)
- ✅ Real-time chat
- ❌ Image/video uploads (requires Cloudinary)
- ❌ Email notifications (requires Resend)

---

## 🚀 **Recommended Full Setup**

For full functionality, set all of these:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify
JWT_SECRET=ChatifySecret
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret
```

---

## ⚠️ **Critical Notes**

1. **`CLIENT_URL` and `FRONTEND_URL`** - Must match your production URL **exactly**:
   - ✅ Correct: `https://chatify-qnms0.sevalla.app`
   - ❌ Wrong: `http://chatify-qnms0.sevalla.app` (missing https)
   - ❌ Wrong: `https://chatify-qnms0.sevalla.app/` (trailing slash)

2. **`MONGODB_URI`** - Make sure:
   - IP whitelist includes your server IP in MongoDB Atlas
   - Username and password are correct
   - Password doesn't have special characters (or URL encode them)

3. **`JWT_SECRET`** - Should be:
   - A strong, random string in production
   - Never share or commit to Git
   - At least 32 characters long

4. **`PORT`** - Usually set by hosting platform (Sevalla), but include it just in case

---

## ✅ **Quick Checklist**

Before deploying, verify:

- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` is correct
- [ ] `JWT_SECRET` is set
- [ ] `CLIENT_URL` matches production URL exactly
- [ ] `FRONTEND_URL` matches production URL exactly
- [ ] MongoDB Atlas IP whitelist includes server IP
- [ ] Cloudinary credentials (if using images/videos)

---

**That's it! Set these in your Sevalla dashboard and you're ready to deploy! 🚀**

