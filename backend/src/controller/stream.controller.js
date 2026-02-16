import { StreamClient } from '@stream-io/node-sdk';
import { ENV } from '../config/env.js';

export const generateStreamToken = async (req, res) => {
    try {
        const { userId, userName } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const apiKey = ENV.STREAM_API_KEY;
        const apiSecret = ENV.STREAM_SECRET_KEY;

        if (!apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: 'Stream credentials are not configured'
            });
        }

        const client = new StreamClient(apiKey, apiSecret);

        // Generate token with 24 hours expiration
        const token = client.createToken(userId);

        // Provide the frontend with the API key as well
        res.json({
            success: true,
            token,
            apiKey
        });

    } catch (error) {
        console.error('❌ Error generating Stream token:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate video call token',
            error: error.message
        });
    }
};
