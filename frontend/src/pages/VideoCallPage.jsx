import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { PhoneOff, Loader2 } from 'lucide-react';

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
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  const callId = searchParams.get('callId') || randomID(5);

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

    // Only initialize once
    if (initializedRef.current) return;
    
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

        // Generate Kit Token for ZegoCloud
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID, // App ID as number
          ZEGO_SERVER_SECRET,
          callId,
          authUser._id,
          authUser.fullName || 'User'
        );

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
          onLeave: () => {
            console.log('👋 Leaving ZegoCloud call...');
            // Show a confirmation dialog with rejoin option
            const shouldRejoin = window.confirm('Call ended. Would you like to rejoin the call?');
            if (shouldRejoin) {
              // Reset the call state and retry
              setError(null);
              setLoading(true);
              initializedRef.current = false;
              // The useEffect will automatically retry
            } else {
              navigate('/chat');
            }
          },
        });

        console.log('✅ Successfully joined ZegoCloud call');
        initializedRef.current = true;
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
        setError(err.message || 'Failed to initialize video call. Please try again.');
        setLoading(false);
      }
    };

    // Add a small delay to ensure container is ready
    const timer = setTimeout(() => {
      initializeZegoCall();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [authUser, navigate, callId]);

  const handleLeaveCall = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-white text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Connecting to Video Call
          </h2>
          <p className="text-blue-200 text-lg">Please wait while we connect you...</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

        if (error) {
          return (
            <div className="h-screen w-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <div className="text-red-400 text-6xl">⚠️</div>
                </div>
                <h2 className="text-white text-3xl font-bold mb-4">Connection Error</h2>
                <p className="text-red-200 mb-8 text-lg">{error}</p>
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
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Chat
            </button>
                </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {targetUserName ? targetUserName.charAt(0).toUpperCase() : 'V'}
            </span>
          </div>
        <div>
            <h1 className="text-white text-xl font-bold">
            {targetUserName ? `Video Call with ${targetUserName}` : 'Video Call'}
            </h1>
            <p className="text-blue-200 text-sm">Call ID: {callId}</p>
          </div>
            </div>
            <button
          onClick={handleLeaveCall}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <PhoneOff className="w-5 h-5" />
          Leave Call
                </button>
              </div>

      {/* Video Container */}
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={containerRef}
                className="h-full w-full"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  minHeight: '500px',
                  backgroundColor: '#000',
                  position: 'relative',
                  zIndex: 1
                }}
              />
        
        {/* Floating UI Elements */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <div className="bg-black/50 backdrop-blur-lg rounded-full p-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
      </div>

        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-lg rounded-full px-4 py-2">
          <p className="text-white text-sm font-medium">Live</p>
          </div>
        </div>
    </div>
  );
}