# 🚀 Production Deployment Checklist for Sevalla

## ✅ Local Status
- ✅ MongoDB connection working locally
- ✅ Authentication working locally
- ✅ Signup/Login working locally

## 🔧 Production Fixes Applied

### 1. Cookie Configuration ✅
- Changed `sameSite` to `'none'` for production (required for cross-site cookies)
- Enabled `secure: true` for HTTPS
- Cookies will now work in production

### 2. CORS Configuration ✅
- Updated to use `FRONTEND_URL` or `CLIENT_URL` from environment variables
- Will allow requests from your production domain

### 3. Arcjet Protection ✅
- Skips Arcjet if `ARCJET_KEY` is not set (allows requests through)

## 📋 What to Do in Sevalla Production

### Step 1: Set Environment Variables

In your Sevalla dashboard, add these environment variables:

```env
NODE_ENV=production
PORT=3000

# MongoDB Connection
MONGODB_URI=mongodb+srv://kaif00786001:XbKRulgLDA5kIfjZ@scalermern.sn7qnyx.mongodb.net/chatify

# Authentication
JWT_SECRET=ChatifySecret

# Frontend URL (CRITICAL - must match your production URL)
CLIENT_URL=https://chatify-qnms0.sevalla.app
FRONTEND_URL=https://chatify-qnms0.sevalla.app

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional - Leave empty to disable Arcjet
ARCJET_KEY=
```

### Step 2: Fix MongoDB Atlas IP Whitelist ⚠️ CRITICAL

This is likely the main issue causing 500 errors in production:

1. **Go to MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com
   - Login to your account

2. **Network Access:**
   - Click on "Network Access" in the left sidebar
   - Click "Add IP Address" button

3. **Add Production Server IP:**
   - Option 1: Add your Sevalla server's IP address (more secure)
   - Option 2: Add `0.0.0.0/0` for testing (allows all IPs - ⚠️ less secure)
   - Click "Confirm"

4. **Wait 1-2 minutes** for changes to apply

### Step 3: Deploy Code

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix production deployment - cookies and CORS"
   git push origin master
   ```

2. **Redeploy on Sevalla:**
   - If auto-deploy is enabled, it will deploy automatically
   - Or manually trigger deployment in Sevalla dashboard

### Step 4: Verify Deployment

After deployment, check:

1. **Server Logs in Sevalla:**
   - Look for: `✅ Server is running`
   - Look for: `🚀 Database connected successfully`
   - Check for any error messages

2. **Test Authentication:**
   - Try signing up a new user
   - Try logging in
   - Check browser console for errors

3. **Check Cookies:**
   - Open browser DevTools → Application → Cookies
   - Verify cookies are being set after login
   - Check if cookies have `Secure` flag (should be true)

## 🐛 Troubleshooting

### If you still get 500 errors:

1. **Check MongoDB Connection:**
   - Verify `MONGODB_URI` is set correctly in Sevalla
   - Check MongoDB Atlas Network Access (IP whitelist)
   - Verify username and password are correct

2. **Check Environment Variables:**
   - Make sure `CLIENT_URL` matches your exact production URL
   - Verify `NODE_ENV=production` is set
   - Check all required variables are set

3. **Check Server Logs:**
   - Look in Sevalla dashboard for error logs
   - Check for MongoDB connection errors
   - Look for authentication errors

### Common Issues:

| Issue | Solution |
|-------|----------|
| 500 error on signup/login | Check MongoDB IP whitelist in Atlas |
| Cookies not working | Verify `CLIENT_URL` is set correctly |
| CORS errors | Check `FRONTEND_URL` matches production URL |
| Database timeout | Verify MongoDB connection string and IP whitelist |

## 📝 Quick Reference

### Your Production URL:
```
https://chatify-qnms0.sevalla.app
```

### Required Environment Variables:
- `NODE_ENV=production`
- `CLIENT_URL=https://chatify-qnms0.sevalla.app`
- `FRONTEND_URL=https://chatify-qnms0.sevalla.app`
- `MONGODB_URI=your_connection_string`
- `JWT_SECRET=your_secret`

### MongoDB Atlas Setup:
- Network Access → Add IP: `0.0.0.0/0` (for testing) or your server IP
- Wait 1-2 minutes after adding IP

## ✅ Success Indicators

After deployment, you should see:

1. ✅ Server logs show: `🚀 Database connected successfully`
2. ✅ Signup works without 500 errors
3. ✅ Login works and sets cookies
4. ✅ Cookies have `Secure` flag in browser
5. ✅ No CORS errors in browser console

## 🆘 Need Help?

If still having issues:

1. Check Sevalla server logs for specific errors
2. Verify all environment variables are set
3. Test MongoDB connection from a separate script
4. Check browser console for client-side errors
5. Verify cookies are being sent/received properly

---

**Next Steps:**
1. Set environment variables in Sevalla
2. Fix MongoDB IP whitelist
3. Deploy/redeploy
4. Test signup/login

