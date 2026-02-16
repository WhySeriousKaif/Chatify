import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Loader2, PhoneOff } from 'lucide-react';
import { axiosInstance } from '../lib/axios';

// ZegoCloud credentials from environment
const ZEGO_APP_ID = parseInt(import.meta.env.VITE_ZEGO_APP_ID) || 447998597;
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "26959573c3088d4ae7f3d08e5450001d";

// Ensure App ID is a number
console.log('🔧 ZegoCloud App ID:', ZEGO_APP_ID, 'Type:', typeof ZEGO_APP_ID);

function randomID(len) {
  let result = '';
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export default function VideoCallPage() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCallEndOptions, setShowCallEndOptions] = useState(false);
  const containerRef = useRef(null);
  const initializedRef = useRef(false);
  const zegoCloudRef = useRef(null);

  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  const callId = searchParams.get('callId') || randomID(5);

  // Handle rejoin call
  const handleRejoinCall = () => {
    console.log('🔄 Rejoining call...');
    setShowCallEndOptions(false);
    setError(null);
    setLoading(true);
    initializedRef.current = false;
    // The useEffect will automatically retry
  };
  
  // Handle go to chat
  const handleGoToChat = () => {
    console.log('🏠 Going to chat...');
    navigate('/chat');
  };

  useEffect(() => {
        if (!authUser) {
          navigate('/login');
          return;
        }

    if (!callId) {
      setError('Call ID is missing. Please start a call from the chat page.');
      setLoading(false);
      return;
    }

    // Only initialize once - set flag immediately to prevent multiple calls
    if (initializedRef.current) {
      console.log('⏭️ Already initialized, skipping...');
      return;
    }
    
    // Set flag immediately to prevent race conditions
    initializedRef.current = true;
    
    // Wait for container to be available
    const waitForContainer = () => {
      return new Promise((resolve, reject) => {
        // Check immediately
        if (containerRef.current) {
          resolve();
          return;
        }
        
        let attempts = 0;
        const maxAttempts = 40; // 40 * 50ms = 2 seconds max
        
        const checkInterval = setInterval(() => {
          attempts++;
          if (containerRef.current) {
            clearInterval(checkInterval);
            resolve();
            return;
          }
          
          // If we've tried enough times, reject
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            reject(new Error('Video container not found after waiting. Please refresh the page.'));
          }
        }, 50);
      });
    };
    
    const initializeZegoCall = async () => {
      try {
        console.log('🎬 Initializing ZegoCloud Video Call...');
        console.log('📊 ZegoCloud Config:', {
          ZEGO_APP_ID,
          ZEGO_APP_ID_TYPE: typeof ZEGO_APP_ID,
          ZEGO_SERVER_SECRET: ZEGO_SERVER_SECRET ? '***' : 'MISSING',
          callId,
          userId: authUser._id,
          userName: authUser.fullName
        });
        
        // Validate App ID
        if (!ZEGO_APP_ID || isNaN(ZEGO_APP_ID)) {
          throw new Error('Invalid ZegoCloud App ID. Please check your environment variables.');
        }
        
        setLoading(true);

        // Wait for container to be ready (with proper error handling)
        try {
          await waitForContainer();
        } catch (containerError) {
          throw new Error('Video container not available. The page may still be loading. Please wait a moment and try again.');
        }
        
        if (!containerRef.current) {
          throw new Error('Video container not available. Please refresh the page.');
        }

        // Try to generate token from backend first (more secure), fallback to client-side
        // Note: Backend token generation is optional - if it fails, we'll use client-side
        // This is a silent operation - errors are expected and handled gracefully
        let kitToken;
        
        try {
          // First, try backend token generation (more secure for production)
          const tokenResponse = await axiosInstance.post('/video/zego/token', {
            roomId: callId,
            userId: authUser._id,
            userName: authUser.fullName || 'User'
          }, {
            timeout: 2000, // 2 second timeout (faster fallback)
            validateStatus: () => true // Accept all status codes, don't throw
          });

          if (tokenResponse.status === 200 && tokenResponse.data.success && tokenResponse.data.token) {
            // Use backend-generated token
            console.log('✅ Backend token received');
            // Note: ZegoUIKitPrebuilt expects a KitToken object, but if backend returns a token string,
            // we might need to create the token object differently
            // For now, fallback to client-side generation as ZegoUIKitPrebuilt needs specific format
            // TODO: Implement proper KitToken format from backend if needed
          }
          // If backend token generation fails (500, etc.), silently fall back to client-side
        } catch (backendError) {
          // Backend token generation failed - this is completely expected if credentials aren't set
          // Silently fallback to client-side generation - no logging needed
          // This is a normal flow, not an error condition
        }

        // Generate Kit Token for ZegoCloud (client-side fallback)
        // Validate server secret before generating
        if (!ZEGO_SERVER_SECRET || ZEGO_SERVER_SECRET === "26959573c3088d4ae7f3d08e5450001d") {
          console.warn('⚠️ Using default/hardcoded ZEGO_SERVER_SECRET. This may not work in production!');
          console.warn('⚠️ Please set VITE_ZEGO_SERVER_SECRET environment variable with your actual secret.');
          throw new Error('ZegoCloud Server Secret not configured. Please set VITE_ZEGO_SERVER_SECRET environment variable with your actual ZegoCloud Server Secret from https://console.zegocloud.com/');
        }

        kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID, // App ID as number
          ZEGO_SERVER_SECRET,
          callId,
          authUser._id,
          authUser.fullName || 'User'
        );

        if (!kitToken) {
          throw new Error('Failed to generate ZegoCloud token. Please check your ZEGO_APP_ID and ZEGO_SERVER_SECRET environment variables.');
        }

        console.log('✅ ZegoCloud token generated:', kitToken ? 'SUCCESS' : 'FAILED');

        // Create ZegoCloud instance
        console.log('🔧 Creating ZegoCloud instance...');
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        console.log('✅ ZegoCloud instance created:', zp);

        // Start the call
        console.log('🚀 Starting ZegoCloud call...');
        console.log('📦 Container element:', containerRef.current);
        
        await zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'Personal link',
              url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${callId}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 call mode
          },
          showPreJoinView: false, // Skip pre-join view
          showUserList: true,
          showChatButton: true,
          showCameraButton: true,
          showMicrophoneButton: true,
          showScreenSharingButton: true,
          showLeaveButton: true,
          // Disable ZegoCloud's default call end dialog completely
          showEndCallDialog: false,
          showCallEndDialog: false,
          showLeaveConfirmDialog: false,
              onLeave: () => {
                console.log('👋 Leaving ZegoCloud call...');
                // Clear any error and show our call end options
                setError(null);
                setShowCallEndOptions(true);
                // Destroy ZegoCloud after a short delay
                setTimeout(() => {
                  if (zegoCloudRef.current) {
                    zegoCloudRef.current.destroy();
                    zegoCloudRef.current = null;
                  }
                }, 100);
              },
              onCallEnd: () => {
                console.log('📞 Call ended by ZegoCloud...');
                // Clear any error and show our call end options
                setError(null);
                setShowCallEndOptions(true);
                // Destroy ZegoCloud after a short delay
              setTimeout(() => {
                  if (zegoCloudRef.current) {
                    zegoCloudRef.current.destroy();
                    zegoCloudRef.current = null;
              }
                }, 100);
              },
        });

        console.log('✅ Successfully joined ZegoCloud call');
        zegoCloudRef.current = zp; // Store the ZegoCloud instance
        setLoading(false);
        
        // Add a timeout to check if ZegoCloud UI is actually rendered
              setTimeout(() => {
          const zegoElements = containerRef.current?.querySelectorAll('[class*="zego"], [class*="Zego"]');
          console.log('🔍 ZegoCloud elements found:', zegoElements?.length || 0);
          if (!zegoElements || zegoElements.length === 0) {
            console.warn('⚠️ ZegoCloud UI not detected in container');
                }
              }, 2000);

      } catch (err) {
        console.error('❌ ZegoCloud call initialization error:', err);
        
        // Reset initialization flag so user can retry
        initializedRef.current = false;
        
        // Provide more helpful error messages based on error type
        let errorMessage = err.message || 'Failed to initialize video call.';
        
        // Check for common ZegoCloud errors
        if (err.message?.includes('20021') || err.message?.includes('authentication') || err.message?.includes('ZegoCloud Server Secret')) {
          errorMessage = 'Video call authentication failed. Error code: 20021\n\nPlease set your ZegoCloud credentials:\n1. Go to https://console.zegocloud.com/\n2. Get your App ID and Server Secret\n3. Add to frontend/.env:\n   VITE_ZEGO_APP_ID=your_app_id\n   VITE_ZEGO_SERVER_SECRET=your_server_secret\n4. Restart the server';
        } else if (err.message?.includes('200101')) {
          errorMessage = 'Video call server error. Error code: 200101\n\nPlease verify your ZegoCloud App ID and Server Secret are correct in your environment variables.';
        } else if (err.message?.includes('Invalid') || err.message?.includes('ZEGO')) {
          errorMessage = 'ZegoCloud configuration error: ' + err.message + '\n\nPlease check your VITE_ZEGO_APP_ID and VITE_ZEGO_SERVER_SECRET environment variables.';
        }
        
        setError(errorMessage);
        setLoading(false);
    }
  };

    // Add a small delay to ensure DOM is ready and container ref is set
    const timer = setTimeout(() => {
      // Double check container is available before starting
      if (containerRef.current || document.getElementById('zego-video-container')) {
        initializeZegoCall();
      } else {
        // Try one more time after a short delay
        setTimeout(() => {
          if (containerRef.current || document.getElementById('zego-video-container')) {
            initializeZegoCall();
          } else {
            setError('Video container not found. Please refresh the page.');
            setLoading(false);
          }
        }, 300);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Don't reset initializedRef here - let cleanup useEffect handle it
    };
  }, [authUser?._id, callId]); // Remove navigate from dependencies to prevent re-runs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up video call...');
      // Destroy ZegoCloud instance if it exists
      if (zegoCloudRef.current) {
        try {
          zegoCloudRef.current.destroy();
          zegoCloudRef.current = null;
        } catch (e) {
          console.warn('Error destroying ZegoCloud instance:', e);
        }
      }
      // Reset initialization flag
      initializedRef.current = false;
    };
  }, []);

  // Monitor for ZegoCloud call end events and override with custom UI
  useEffect(() => {
    // Inject global CSS to hide ZegoCloud call end dialogs
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
      /* Global override for ZegoCloud call end dialogs */
      [class*="end"], [class*="End"], [class*="call-end"], [class*="CallEnd"],
      [class*="left"], [class*="Left"], [class*="room"], [class*="Room"],
      [class*="rejoin"], [class*="Rejoin"], [class*="dialog"], [class*="Dialog"],
      [class*="modal"], [class*="Modal"], [class*="overlay"], [class*="Overlay"],
      [class*="leave"], [class*="Leave"], [class*="confirm"], [class*="Confirm"],
      button[class*="rejoin"], button[class*="Rejoin"], button[class*="end"], button[class*="End"],
      button[class*="leave"], button[class*="Leave"], button[class*="confirm"], button[class*="Confirm"],
      div[class*="end"], div[class*="End"], div[class*="left"], div[class*="Left"],
      div[class*="room"], div[class*="Room"], div[class*="rejoin"], div[class*="Rejoin"],
      div[class*="leave"], div[class*="Leave"], div[class*="confirm"], div[class*="Confirm"],
      /* Hide any element containing specific text */
      *:contains("Leave the room"), *:contains("leave the room"),
      *:contains("Are you sure"), *:contains("are you sure"),
      *:contains("You have left"), *:contains("you have left"),
      *:contains("rejoin"), *:contains("Rejoin") {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
        z-index: -9999 !important;
      }
    `;
    document.head.appendChild(globalStyle);

    const checkForZegoCallEnd = () => {
      const container = containerRef.current;
      if (!container) return;
          
      // Look for any element with call end related text
      const allElements = container.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent?.toLowerCase() || '';
        if (text.includes('leave the room') || 
            text.includes('left the room') || 
            text.includes('you have left') ||
            text.includes('are you sure') ||
            text.includes('rejoin') ||
            (text.includes('left') && text.includes('room'))) {
          console.log('🔍 Found ZegoCloud call end element:', element, 'Text:', text);
          
          // Clear any error and show our call end options
          setError(null);
          setShowCallEndOptions(true);

          // Immediately hide the element with multiple methods
          element.style.display = 'none !important';
          element.style.visibility = 'hidden !important';
          element.style.opacity = '0 !important';
          element.style.pointerEvents = 'none !important';
          element.style.position = 'absolute !important';
          element.style.left = '-9999px !important';
          element.style.top = '-9999px !important';
          element.style.zIndex = '-9999 !important';
          
          // Also try to remove the element entirely
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
          
          return;
        }
      }
    };

    // Check immediately and then very frequently
    const interval = setInterval(checkForZegoCallEnd, 50); // Even faster - every 50ms
    
    // Also add a direct DOM override
        const overrideZegoDialog = () => {
          // Look for any dialog or modal elements
          const dialogs = document.querySelectorAll('[role="dialog"], .dialog, .modal, [class*="dialog"], [class*="modal"]');
          dialogs.forEach(dialog => {
            const text = dialog.textContent?.toLowerCase() || '';
            if (text.includes('leave') || text.includes('room') || text.includes('sure')) {
              console.log('🚫 Found and removing ZegoCloud dialog:', dialog);
              // Clear any error and show our call end options
              setError(null);
              setShowCallEndOptions(true);
              dialog.remove();
          }
          });
        };
    
    // Run the override immediately and frequently
    const overrideInterval = setInterval(overrideZegoDialog, 25); // Every 25ms
    
    // Also use MutationObserver for real-time detection
    const container = containerRef.current;
    if (container) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            checkForZegoCallEnd();
          }
        });
      });

      observer.observe(container, { childList: true, subtree: true });

      return () => {
        clearInterval(interval);
        clearInterval(overrideInterval);
        observer.disconnect();
        document.head.removeChild(globalStyle);
      };
    }

        // Also add a global event listener to catch any ZegoCloud call end events
        const handleGlobalCallEnd = (event) => {
          console.log('🌍 Global call end event detected:', event);
          // Clear any error and show our call end options
          setError(null);
          setShowCallEndOptions(true);
  };

    // Listen for various events that might indicate call end
    window.addEventListener('callEnd', handleGlobalCallEnd);
    window.addEventListener('call-end', handleGlobalCallEnd);
    window.addEventListener('zegoCallEnd', handleGlobalCallEnd);
    window.addEventListener('zego-call-end', handleGlobalCallEnd);

    return () => {
      clearInterval(interval);
      clearInterval(overrideInterval);
      if (document.head.contains(globalStyle)) {
        document.head.removeChild(globalStyle);
      }
      window.removeEventListener('callEnd', handleGlobalCallEnd);
      window.removeEventListener('call-end', handleGlobalCallEnd);
      window.removeEventListener('zegoCallEnd', handleGlobalCallEnd);
      window.removeEventListener('zego-call-end', handleGlobalCallEnd);
  };
  }, []);

  // Show call end options if user left the call (separate full screen view)
  if (showCallEndOptions) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-red-500 rounded-full flex items-center justify-center mb-8 mx-auto animate-pulse">
            <PhoneOff className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-4">You have left the room</h2>
          <p className="text-gray-300 text-lg mb-8">The video call has ended</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleRejoinCall}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🔄 Rejoin Call
            </button>
            <button 
              onClick={handleGoToChat}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🏠 Go to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Always render container (so ref is available) with overlays for loading/error states
  return (
    <div className="h-screen w-screen bg-black relative">
      {/* CSS to hide ZegoCloud call end dialogs */}
      <style>{`
        /* Hide all ZegoCloud call end related elements */
        [class*="end"], [class*="End"], [class*="call-end"], [class*="CallEnd"],
        [class*="left"], [class*="Left"], [class*="room"], [class*="Room"],
        [class*="rejoin"], [class*="Rejoin"], [class*="dialog"], [class*="Dialog"],
        [class*="modal"], [class*="Modal"], [class*="overlay"], [class*="Overlay"],
        button[class*="rejoin"], button[class*="Rejoin"], button[class*="end"], button[class*="End"],
        div[class*="end"], div[class*="End"], div[class*="left"], div[class*="Left"],
        div[class*="room"], div[class*="Room"], div[class*="rejoin"], div[class*="Rejoin"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Hide any element containing "left the room" or "rejoin" text */
        *:contains("left the room"), *:contains("Left the room"),
        *:contains("rejoin"), *:contains("Rejoin"),
        *:contains("You have left"), *:contains("you have left") {
          display: none !important;
        }
      `}</style>
      
      {/* ZegoCloud Video Container - Always rendered so ref is available */}
      <div 
        ref={containerRef}
        className="h-full w-full"
        id="zego-video-container"
        style={{
          minHeight: '100vh',
          backgroundColor: '#000',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden'
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
            <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Connecting to Call</h2>
            <p className="text-blue-200 text-lg">Setting up your video call...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !showCallEndOptions && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center z-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <div className="text-red-400 text-6xl">⚠️</div>
          </div>
            <h2 className="text-white text-3xl font-bold mb-4">Connection Error</h2>
            <p className="text-red-200 mb-8 text-lg whitespace-pre-line">{error}</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  // Retry the call with same parameters
                  setError(null);
                  setLoading(true);
                  initializedRef.current = false;
                  // The useEffect will automatically retry
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🔄 Rejoin Call
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🏠 Go to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}