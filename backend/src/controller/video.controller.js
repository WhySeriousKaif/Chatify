// Stream configuration
const STREAM_API_KEY = 'web8ees7hcfw';

// Generate Stream token for video calling
export const generateStreamToken = async (req, res) => {
  try {
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // For development, we'll use a simple token approach
    // In production, you would use Stream's server-side SDK to generate proper tokens
    const token = `dev-token-${userId}-${Date.now()}`;

    res.status(200).json({
      success: true,
      token,
      apiKey: STREAM_API_KEY,
      user: {
        id: userId,
        name: userName || 'User'
      }
    });

  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate video call token'
    });
  }
};
