# 🚨 Server Crash - Quick Fix Guide

## ❌ Current Status
**Web Process: CRASHED**

## 🔍 **Most Likely Causes**

Based on your setup, the crash is likely due to:

### 1. **MongoDB Connection Failure** (90% likely)
- Server starts but crashes when trying to connect to MongoDB
- MongoDB Atlas IP whitelist not configured for your server

### 2. **Port Binding Issue** (Fixed in code)
- Already fixed to use `process.env.PORT`
- Server now binds to `0.0.0.0`

---

## ✅ **IMMEDIATE ACTIONS**

### **Step 1: Check Runtime Logs** ⚠️ **MOST IMPORTANT**

In Sevalla dashboard:
1. Click **"View logs"** button on the Chatify process card
2. Look for the **actual error message**
3. Share the error - this will tell us exactly what's wrong

### **Step 2: Fix MongoDB Atlas IP Whitelist** ⚠️ **CRITICAL**

This is the #1 cause of crashes:

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com
   - Login

2. **Network Access:**
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Enter: `0.0.0.0/0` (allows all IPs - for testing)
   - OR find your Sevalla server IP and add it
   - Click "Confirm"
   - **Wait 1-2 minutes** for changes to apply

### **Step 3: Remove PORT from Environment Variables**

Many hosting platforms automatically assign ports:

1. Go to Sevalla → Environment Variables
2. **DELETE** the `PORT=3000` variable
3. Let Sevalla assign the port automatically

### **Step 4: Verify Environment Variables**

Make sure these are set correctly:

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

### **Step 5: Redeploy**

After fixing MongoDB and removing PORT:
1. Wait 1-2 minutes for MongoDB changes
2. Redeploy in Sevalla (or auto-deploy will trigger)
3. Check logs again

---

## 📋 **What the Logs Should Show**

After fixes, you should see:

**✅ Success:**
```
✅ Server is running on port 8080  (or assigned port)
🌐 Production mode enabled
🚀 Database connected successfully
✅ MongoDB Connected: scalermern.sn7qnyx.mongodb.net
```

**❌ Still Crashing?**
- Share the error from Runtime Logs
- Common errors: MongoDB auth failed, module not found, port conflict

---

## 🎯 **Priority Order**

1. **FIRST:** Check Runtime Logs to see actual error
2. **SECOND:** Fix MongoDB Atlas IP whitelist
3. **THIRD:** Remove PORT from environment variables
4. **FOURTH:** Redeploy and check again

---

## 🆘 **Need More Help?**

Share the error message from **Runtime Logs** and I can provide a specific fix!

**Most likely:** MongoDB connection failure - fix the IP whitelist first! 🚀

