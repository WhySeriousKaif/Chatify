# 🚨 Server Crash Fix Guide

## Current Status
**Web Process:** ❌ **CRASHED**

## 🔍 **Analysis**

From your Sevalla dashboard:
- ✅ Environment variables are set correctly
- ✅ Deployment builds successfully  
- ❌ Server crashes after starting
- Network shows port `8080` connection

## 🔧 **Fixes Applied**

### 1. **Port Binding Fix** ✅
- Changed to use `process.env.PORT` directly (hosting platforms auto-assign)
- Bind to `0.0.0.0` instead of default (required for production)

### 2. **Cloudinary Error Handling** ✅
- Won't crash if Cloudinary credentials are missing

## 📋 **What You Need to Do**

### **Step 1: Check Runtime Logs** ⚠️ CRITICAL

Click **"View logs"** button in Sevalla dashboard to see the actual error causing the crash.

Common errors you might see:

1. **MongoDB Connection Error:**
   ```
   ❌ MongoDB connection error: bad auth
   ```
   **Fix:** Check MongoDB Atlas IP whitelist

2. **Port Error:**
   ```
   EADDRINUSE: address already in use
   ```
   **Fix:** Remove PORT from environment variables (already handled in code)

3. **Module Not Found:**
   ```
   Error: Cannot find module
   ```
   **Fix:** Check if all dependencies are installed

### **Step 2: Remove PORT from Environment Variables**

**IMPORTANT:** Many hosting platforms (like Sevalla) automatically assign ports.

**Action in Sevalla:**
1. Go to **Environment Variables**
2. **DELETE** the `PORT=3000` variable
3. Let Sevalla assign the port automatically

The code now uses `process.env.PORT` which Sevalla sets automatically.

### **Step 3: Verify MongoDB Atlas**

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com
   - Login to your account

2. **Network Access:**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Add `0.0.0.0/0` (for testing) OR your Sevalla server IP
   - Click "Confirm"
   - **Wait 1-2 minutes** for changes

3. **Verify Connection String:**
   - Make sure `MONGODB_URI` in Sevalla is correct
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

### **Step 4: Redeploy**

After making changes:

1. **If you removed PORT variable:**
   - Just wait for auto-redeploy, or
   - Click "Deploy now" in Sevalla

2. **If you changed MongoDB:**
   - Wait 1-2 minutes for IP whitelist to apply
   - Then redeploy

### **Step 5: Check Runtime Logs Again**

After redeploy, check logs for:

**✅ Success indicators:**
```
✅ Server is running on port 8080  (or whatever port is assigned)
🌐 Production mode enabled
🚀 Database connected successfully
```

**❌ Still crashing?** Look for specific error messages in logs.

---

## 🎯 **Most Likely Causes**

### 1. **MongoDB Connection Failure** (90% likely)
- **Symptom:** Server starts then crashes
- **Fix:** Add IP to MongoDB Atlas Network Access
- **Check logs for:** "MongoDB connection error" or "authentication failed"

### 2. **Port Binding Issue** (Already fixed in code)
- **Symptom:** Port already in use error
- **Fix:** Remove PORT from env vars (let Sevalla assign)
- **Check logs for:** "EADDRINUSE"

### 3. **Missing Dependencies**
- **Symptom:** "Cannot find module" error
- **Fix:** Check if all packages are in package.json
- **Check logs for:** "Error: Cannot find module"

---

## 📝 **Current Environment Variables (Keep These)**

✅ **Keep all these in Sevalla:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify
JWT_SECRET=ChatifySecret
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
CLOUDINARY_CLOUD_NAME=dsqwxhqan
CLOUDINARY_API_KEY=455458822697726
CLOUDINARY_API_SECRET=ooiZpgb_2wadenio383eGPSZM2U
```

❌ **REMOVE this:**
```
PORT=3000  ← DELETE THIS (Sevalla assigns port automatically)
```

---

## 🔍 **Debugging Steps**

1. **Click "View logs" in Sevalla dashboard**
   - Look for the actual error message
   - Copy the error and check what it says

2. **Check MongoDB Atlas:**
   - Network Access → Verify IP is whitelisted
   - Database Access → Verify user exists and password is correct

3. **Test Locally First:**
   - Make sure app works locally
   - Verify MongoDB connects locally

4. **Check Build Logs:**
   - Make sure all dependencies installed
   - No build errors

---

## ✅ **Quick Action Items**

1. ⚠️ **Check Runtime Logs** - See actual error (MOST IMPORTANT)
2. ⚠️ **Fix MongoDB IP Whitelist** - Add server IP to MongoDB Atlas
3. ⚠️ **Remove PORT variable** - Let Sevalla assign port automatically
4. ⚠️ **Redeploy** - After making changes

---

## 🆘 **Need Help?**

Share the error message from **Runtime Logs** and I can help fix it specifically!

The most common issue is **MongoDB connection failure** - check MongoDB Atlas Network Access first! 🚀

