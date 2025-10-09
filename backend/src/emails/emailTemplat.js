export function createWelcomeEmailTemplate(name, clientURL) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Chatify</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header Card -->
        <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border-radius: 24px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); overflow: hidden; margin-bottom: 20px;">
          
          <!-- Hero Section -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; position: relative;">

            
            <!-- Logo/Icon -->
            <div style="width: 80px; height: 80px; background: rgba(255, 255, 255, 0.2); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.3);">
              <div style="font-size: 36px;">💬</div>
            </div>
            
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Welcome to Chatify!</h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 18px; font-weight: 400;">Your journey starts here</p>
          </div>
          
          <!-- Content Section -->
          <div style="padding: 50px 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h2 style="color: #2d3748; margin: 0 0 15px; font-size: 24px; font-weight: 600;">Hello ${name}! 👋</h2>
              <p style="color: #718096; margin: 0; font-size: 16px; line-height: 1.6;">We're thrilled to have you join our community. Get ready to connect, chat, and share amazing moments with people who matter most.</p>
            </div>
            
            <!-- Features Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 40px 0;">
              <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="font-size: 32px; margin-bottom: 15px;">🚀</div>
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #2d3748;">Lightning Fast</h3>
                <p style="margin: 0; font-size: 14px; color: #718096;">Real-time messaging</p>
              </div>
              <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="font-size: 32px; margin-bottom: 15px;">🔒</div>
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #2d3748;">Secure & Private</h3>
                <p style="margin: 0; font-size: 14px; color: #718096;">End-to-end encryption</p>
              </div>
              <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="font-size: 32px; margin-bottom: 15px;">📱</div>
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #2d3748;">Cross Platform</h3>
                <p style="margin: 0; font-size: 14px; color: #718096;">Works everywhere</p>
              </div>
              <div style="text-align: center; padding: 25px; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="font-size: 32px; margin-bottom: 15px;">✨</div>
                <h3 style="margin: 0 0 10px; font-size: 16px; font-weight: 600; color: #2d3748;">Rich Features</h3>
                <p style="margin: 0; font-size: 14px; color: #718096;">Photos, videos & more</p>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 50px 0 40px;">
              <a href="${clientURL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; border: none; cursor: pointer; position: relative; overflow: hidden;">
                <span style="position: relative; z-index: 2;">Start Chatting Now</span>
                <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s;"></div>
              </a>
            </div>
         
            
            <!-- Support Section -->
            <div style="text-align: center; padding: 30px; background: #f7fafc; border-radius: 16px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #2d3748;">Need Help?</h3>
              <p style="margin: 0 0 20px; color: #718096; font-size: 15px;">Our support team is here to help you get the most out of Chatify.</p>
              <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="#" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 14px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;">Help Center</a>
                <a href="#" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 14px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;">Contact Support</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 15px; color: #718096; font-size: 15px;">Happy chatting! 🎉</p>
              <p style="margin: 0; color: #a0aec0; font-size: 14px;">Best regards,<br><strong style="color: #2d3748;">The Chatify Team</strong></p>
            </div>
          </div>
        </div>
        
        <!-- Bottom Footer -->
        <div style="text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.8); font-size: 12px;">
          <p style="margin: 0 0 10px;">© 2025 Chatify. All rights reserved.</p>
          <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <a href="#" style="color: rgba(255, 255, 255, 0.8); text-decoration: none;">Privacy Policy</a>
            <a href="#" style="color: rgba(255, 255, 255, 0.8); text-decoration: none;">Terms of Service</a>
            <a href="#" style="color: rgba(255, 255, 255, 0.8); text-decoration: none;">Contact Us</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }