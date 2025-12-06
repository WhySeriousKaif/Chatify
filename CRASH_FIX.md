# 🚨 Server Crash Fix

## Current Issue
**Status:** Web process is **CRASHED** ❌

## 🔍 **Likely Causes**

### 1. **Port Binding Issue** (Most Likely)
- Sevalla shows port `8080` in networking
- Your `PORT=3000` in environment variables
- Hosting platforms often assign ports automatically

**Fix:** Use `process.env.PORT` directly (already fixed in code)

### 2. **MongoDB Connection Failure**
- If MongoDB connection fails, it might cause crash
- Check MongoDB Atlas IP whitelist

### 3. **Cloudinary Configuration Error**
- Cloudinary config might fail if credentials are wrong

### 4. **Missing Dependencies**
- Some npm packages might not be installed correctly

---

## ✅ **Fixes Applied**

### 1. Port Configuration
- ✅ Now uses `process.env.PORT` directly (hosting platforms set this automatically)
- ✅ Binds to `0.0.0.0` to accept connections from any network interface

### 2. Better Error Handling
- ✅ Server error handlers added
- ✅ Unhandled rejection handlers
- ✅ Uncaught exception handlers

---

## 🔧 **What You Need to Do**

### **Step 1: Remove PORT from Environment Variables**

In Sevalla dashboard, **REMOVE** the `PORT` variable:
- Many hosting platforms (like Sevalla) automatically assign ports
- They set `process.env.PORT` automatically
- Having `PORT=3000` might conflict

**Action:** Go to Environment Variables → Delete `PORT=3000`

### **Step 2: Check MongoDB Connection**

1. **Verify MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (temporarily for testing)
   - OR add your Sevalla server's IP address
   - Wait 1-2 minutes

2. **Verify MongoDB URI:**
   - Check if connection string is correct
   - Verify username and password

### **Step 3: Check Runtime Logs**

After redeploying, check the **Runtime logs** section to see:
- What error is causing the crash
- Server startup messages
- Database connection status

### **Step 4: Redeploy**

1. Commit and push the port fix:
   ```bash
   git add .
   git commit -m "Fix server port binding for production"
   git push origin master
   ```

2. Or manually redeploy in Sevalla dashboard

---

## 📋 **Environment Variables to Keep**

**Keep these in Sevalla:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify
JWT_SECRET=ChatifySecret
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app
CLOUDINARY_CLOUD_NAME=dsqwxhqan
CLOUDINARY_API_KEY=455458822697726
CLOUDINARY_API_SECRET=ooiZpgb_2wadenio383eGPSZM2U
```

**REMOVE this:**
```env
PORT=3000  ❌ DELETE THIS - Let Sevalla assign port automatically
```

---

## 🔍 **Check Runtime Logs**

After redeploying, look for these messages:

**✅ Success:**
```
✅ Server is running on port 8080  (or whatever port Sevalla assigns)
🌐 Production mode enabled
🚀 Database connected successfully
```

**❌ Error messages to watch for:**
- `Error: Cannot find module` - Missing dependency
- `MongoDB connection error` - Database connection failed
- `EADDRINUSE` - Port already in use
- `ECONNREFUSED` - Connection refused

---

## 🚀 **Quick Fix Steps**

1. **Remove PORT variable** from Sevalla environment variables
2. **Fix MongoDB IP whitelist** in MongoDB Atlas
3. **Redeploy** your application
4. **Check Runtime logs** for specific errors

---

## 🆘 **Still Crashing?**

If still crashing after fixes:

1. **Check Runtime Logs** for specific error message
2. **Verify all environment variables** are set correctly
3. **Check MongoDB Atlas** - IP whitelist and connection string
4. **Test locally** - Make sure it works in development first

The most common issue is the **PORT variable conflict**. Remove it and let Sevalla handle port assignment automatically! 🚀

