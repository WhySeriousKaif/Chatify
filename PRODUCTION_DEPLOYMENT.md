# Production Deployment Guide for Sevalla

## 🔧 Production Fixes Applied

### 1. **Cookie Settings**
- Changed `sameSite` from `'strict'` to `'none'` for production (required for cross-site cookies)
- Enabled `secure: true` in production (required for HTTPS and `sameSite: 'none'`)

### 2. **CORS Configuration**
- Updated to use `FRONTEND_URL` or `CLIENT_URL` from environment variables
- Allows requests from your production frontend URL

### 3. **Arcjet Protection**
- Skips Arcjet if `ARCJET_KEY` is not set (allows requests to go through)

## 📋 Required Environment Variables for Production

Set these in your Sevalla production environment:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatify

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Frontend/Client URL (IMPORTANT!)
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app

# Cloudinary (Image/Video Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Optional)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify

# Security (Optional - can be left empty to disable)
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=production

# Video Calling (Optional)
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_SECRET=your_zego_server_secret
```

## 🔐 Critical Settings for Production

### 1. **MongoDB Connection**

**Check these:**

- ✅ **MongoDB Atlas Network Access**
  - Go to MongoDB Atlas → Network Access
  - Add your Sevalla server's IP address
  - OR add `0.0.0.0/0` temporarily for testing (⚠️ remove after testing)

- ✅ **MongoDB Connection String**
  - Verify username and password are correct
  - URL encode password if it has special characters
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

### 2. **CORS Configuration**

Make sure these match your production URL:
```env
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
```

### 3. **Cookie Settings**

Cookies are now configured for production:
- ✅ `secure: true` (HTTPS only)
- ✅ `sameSite: 'none'` (works with cross-site requests)
- ✅ `httpOnly: true` (security)

## 🚀 Deployment Steps

### Step 1: Set Environment Variables in Sevalla

1. Log into your Sevalla dashboard
2. Go to your project settings
3. Add all environment variables from the list above
4. **Important:** Make sure `CLIENT_URL` and `FRONTEND_URL` match your exact production URL

### Step 2: Fix MongoDB Connection

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add your Sevalla server's IP (or `0.0.0.0/0` for testing)
4. Wait 1-2 minutes for changes to apply

### Step 3: Deploy/Redeploy

1. Push your code to GitHub
2. Redeploy on Sevalla (or let auto-deploy handle it)
3. Check deployment logs for errors

### Step 4: Test

1. Try to signup/login
2. Check browser console for errors
3. Check Sevalla server logs for errors

## 🔍 Troubleshooting

### Error: 500 on Signup/Login

**Possible causes:**
1. **MongoDB Connection Failed**
   - Check MongoDB Atlas Network Access (IP whitelist)
   - Verify connection string is correct
   - Check server logs for MongoDB errors

2. **Missing Environment Variables**
   - Verify all required env vars are set in Sevalla
   - Check `JWT_SECRET` is set
   - Check `MONGODB_URI` is correct

3. **Arcjet Blocking**
   - If `ARCJET_KEY` is not set, Arcjet is disabled (good)
   - If set, check Arcjet logs for blocking reasons

### Error: 401 on /api/auth/check

This is **normal** when not logged in. The app handles this silently.

### Cookies Not Working

**Check:**
1. Frontend and backend are on HTTPS
2. `CLIENT_URL` matches your production URL exactly
3. Cookies are being set (check browser DevTools → Application → Cookies)

### CORS Errors

**Fix:**
1. Set `CLIENT_URL` and `FRONTEND_URL` to your exact production URL
2. Include protocol: `https://chatify-qnms0.sevalla.app`
3. No trailing slash

## 📝 Quick Checklist

Before deploying, verify:

- [ ] All environment variables are set in Sevalla
- [ ] `CLIENT_URL` matches your production URL exactly
- [ ] `MONGODB_URI` is correct and MongoDB IP is whitelisted
- [ ] `JWT_SECRET` is set (use a strong random string)
- [ ] `NODE_ENV=production` is set
- [ ] Frontend build is in `frontend/dist/`
- [ ] Code is pushed to GitHub

## 🔄 After Deployment

1. **Test Authentication:**
   - Try signing up a new user
   - Try logging in
   - Check if cookies are being set

2. **Check Server Logs:**
   - Look for "✅ MongoDB Connected"
   - Look for any error messages
   - Check if server started successfully

3. **Verify Environment:**
   - Check that `NODE_ENV=production`
   - Verify cookies have `secure: true` flag
   - Confirm CORS is allowing your frontend URL

## 🆘 Still Having Issues?

1. **Check Server Logs in Sevalla Dashboard**
   - Look for specific error messages
   - Check MongoDB connection status

2. **Check Browser Console**
   - Look for CORS errors
   - Check network tab for failed requests
   - Verify response status codes

3. **Test MongoDB Connection:**
   - Try connecting from a local script
   - Verify credentials work
   - Check IP whitelist

4. **Verify Environment Variables:**
   - Double-check all vars are set correctly
   - Make sure no typos in URLs
   - Verify secrets are not empty

## 🎯 Expected Behavior After Fix

- ✅ Signup works: Creates user and sets cookie
- ✅ Login works: Authenticates and sets cookie
- ✅ `/api/auth/check` returns user when logged in, 401 when not
- ✅ Cookies are secure and work across requests
- ✅ No CORS errors
- ✅ No 500 errors (unless MongoDB is down)

