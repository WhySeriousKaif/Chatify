// Video calling controller - ZegoCloud token generation
import { ENV } from '../config/env.js';
import crypto from 'crypto';

/**
 * Generate ZegoCloud token for video calling
 * This generates a proper authentication token using the server secret
 */
export const generateZegoToken = async (req, res) => {
  try {
    const { roomId, userId, userName } = req.body;

    // Validate required fields
    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and User ID are required'
      });
    }

    // Get ZegoCloud credentials from environment
    const appId = parseInt(ENV.ZEGO_APP_ID) || parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = ENV.ZEGO_SERVER_SECRET || process.env.ZEGO_SERVER_SECRET;

    // Validate credentials
    if (!appId || isNaN(appId)) {
      console.error('❌ ZegoCloud App ID is missing or invalid');
      return res.status(500).json({
        success: false,
        message: 'ZegoCloud App ID is not configured. Please set ZEGO_APP_ID environment variable.'
      });
    }

    if (!serverSecret) {
      console.error('❌ ZegoCloud Server Secret is missing');
      return res.status(500).json({
        success: false,
        message: 'ZegoCloud Server Secret is not configured. Please set ZEGO_SERVER_SECRET environment variable.'
      });
    }

    // Generate token expiration (24 hours from now)
    const expirationTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours in seconds

    // Create token payload
    const payload = {
      app_id: appId,
      user_id: userId.toString(),
      nonce: Math.floor(Math.random() * 2147483647), // Random nonce
      ctime: Math.floor(Date.now() / 1000), // Current time in seconds
      expire: expirationTime,
      payload: JSON.stringify({
        room_id: roomId,
        user_name: userName || 'User'
      })
    };

    // Create token string to sign
    const tokenString = `${payload.app_id}:${payload.user_id}:${payload.nonce}:${payload.ctime}:${payload.expire}:${payload.payload}`;

    // Generate HMAC signature
    const signature = crypto
      .createHmac('sha256', serverSecret)
      .update(tokenString)
      .digest('hex');

    // Build final token
    const token = Buffer.from(JSON.stringify({
      ...payload,
      signature
    })).toString('base64');

    console.log('✅ ZegoCloud token generated successfully for user:', userId);

    res.json({
      success: true,
      token,
      appId: appId,
      serverTimestamp: Math.floor(Date.now() / 1000)
    });

  } catch (error) {
    console.error('❌ Error generating ZegoCloud token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate video call token',
      error: error.message
    });
  }
};

/**
 * Health check for ZegoCloud configuration
 */
export const checkZegoConfig = async (req, res) => {
  try {
    const appId = parseInt(ENV.ZEGO_APP_ID) || parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = ENV.ZEGO_SERVER_SECRET || process.env.ZEGO_SERVER_SECRET;

    const isConfigured = !!(appId && serverSecret);

    res.json({
      success: true,
      configured: isConfigured,
      appId: appId || null,
      hasServerSecret: !!serverSecret
    });
  } catch (error) {
    console.error('❌ Error checking ZegoCloud config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check ZegoCloud configuration'
    });
  }
};

