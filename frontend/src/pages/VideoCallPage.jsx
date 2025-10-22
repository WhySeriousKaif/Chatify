import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Settings, Users } from 'lucide-react';
import { io } from 'socket.io-client';

export default function VideoCallPage() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get call parameters from URL
  const callId = searchParams.get('callId') || 'default-call';
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  
  // WebRTC states
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, connected, ended, incoming, rejected, waiting, error
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!authUser) {
          navigate('/login');
          return;
        }

        // Get user media first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        
        console.log('Local media stream obtained:', stream);
        setLocalStream(stream);
        
        // Initialize socket connection
        const socketConnection = io('http://localhost:3000', {
          auth: {
            token: document.cookie.split('token=')[1]?.split(';')[0]
          }
        });
        
        setSocket(socketConnection);
        
        // Generate unique call ID
        const newCallId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Socket event handlers
        socketConnection.on('connect', () => {
          console.log('Socket connected for video call');
          
          // If we have a target user, initiate the call
          if (targetUserId) {
            console.log(`Initiating call to ${targetUserName} (${targetUserId})`);
            socketConnection.emit('call-user', {
              targetUserId,
              callerId: authUser._id,
              callerName: authUser.fullName,
              callId: newCallId
            });
            setCallStatus('ringing');
          } else {
            // If no target user, we're waiting for an incoming call
            setCallStatus('waiting');
          }
        });
        
        socketConnection.on('incoming-call', (data) => {
          console.log('Incoming call:', data);
          setCallStatus('incoming');
        });
        
        socketConnection.on('call-accepted', (data) => {
          console.log('Call accepted:', data);
          setCallStatus('connecting');
          startWebRTCNegotiation(socketConnection, stream, data.callId, data.fromUserId);
        });
        
        socketConnection.on('call-rejected', (data) => {
          console.log('Call rejected:', data);
          setCallStatus('rejected');
          setTimeout(() => navigate('/chat'), 3000);
        });
        
        socketConnection.on('call-ended', (data) => {
          console.log('Call ended:', data);
          setCallStatus('ended');
          setTimeout(() => navigate('/chat'), 2000);
        });
        
        socketConnection.on('start-webrtc', (data) => {
          console.log('Starting WebRTC negotiation:', data);
          startWebRTCNegotiation(socketConnection, stream, data.callId, data.fromUserId);
        });
        
        // WebRTC signaling events
        socketConnection.on('webrtc-offer', async (data) => {
          console.log('Received WebRTC offer:', data);
          await handleWebRTCOffer(data);
        });
        
        socketConnection.on('webrtc-answer', async (data) => {
          console.log('Received WebRTC answer:', data);
          await handleWebRTCAnswer(data);
        });
        
        socketConnection.on('webrtc-ice-candidate', async (data) => {
          console.log('Received ICE candidate:', data);
          await handleICECandidate(data);
        });
        
        setIsLoading(false);

      } catch (error) {
        console.error('Error initializing call:', error);
        setError('Failed to initialize video call. Please try again.');
        setIsLoading(false);
      }
    };

    initializeCall();

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [targetUserId, authUser, navigate]);

  // Start WebRTC negotiation
  const startWebRTCNegotiation = async (socketConnection, stream, callId, remotePeerId) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      
      setPeerConnection(pc);
      
      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote stream:', event.streams[0]);
        setRemoteStream(event.streams[0]);
        setIsConnected(true);
        setCallStatus('connected');
      };
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketConnection.emit('webrtc-ice-candidate', {
            callId,
            candidate: event.candidate,
            fromUserId: authUser._id,
            toUserId: remotePeerId || targetUserId
          });
        }
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('WebRTC connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          setCallStatus('connected');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
          setCallStatus('disconnected');
        }
      };
      
      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketConnection.emit('webrtc-offer', {
        callId,
        offer,
        fromUserId: authUser._id,
        toUserId: remotePeerId || targetUserId
      });
      
    } catch (error) {
      console.error('Error starting WebRTC negotiation:', error);
    }
  };

  // Handle WebRTC offer
  const handleWebRTCOffer = async (data) => {
    if (!peerConnection) return;
    
    try {
      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socket.emit('webrtc-answer', {
        callId: data.callId,
        answer,
        fromUserId: authUser._id,
        toUserId: data.fromUserId
      });
    } catch (error) {
      console.error('Error handling WebRTC offer:', error);
    }
  };

  // Handle WebRTC answer
  const handleWebRTCAnswer = async (data) => {
    if (!peerConnection) return;
    
    try {
      await peerConnection.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
    }
  };

  // Handle ICE candidate
  const handleICECandidate = async (data) => {
    if (!peerConnection) return;
    
    try {
      await peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Set up video elements when streams are available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleLeaveCall = () => {
    // Notify other user that call is ending
    if (socket && callId) {
      socket.emit('end-call', {
        callId,
        userId: authUser._id
      });
    }
    
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }
    
    navigate('/chat');
  };

  const handleAcceptCall = () => {
    if (socket && callId) {
      socket.emit('accept-call', {
        callId,
        userId: authUser._id,
        targetUserId: targetUserId // The caller's ID
      });
    }
  };

  const handleRejectCall = () => {
    if (socket && callId) {
      socket.emit('reject-call', {
        callId,
        userId: authUser._id,
        targetUserId: targetUserId // The caller's ID
      });
    }
    navigate('/chat');
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {targetUserName ? `Connecting to ${targetUserName}...` : 'Initializing video call...'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Call ID: {targetUserId ? `call-${[authUser?._id, targetUserId].sort().join('-')}` : callId}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-semibold mb-4">Video Call Error</h2>
          <p className="text-gray-300 text-lg mb-6">{error}</p>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-2">Call Details:</h3>
            <p className="text-gray-300 text-sm">Call ID: {targetUserId ? `call-${[authUser?._id, targetUserId].sort().join('-')}` : callId}</p>
            <p className="text-gray-300 text-sm">Caller: {authUser?.fullName}</p>
            {targetUserName && <p className="text-gray-300 text-sm">Calling: {targetUserName}</p>}
          </div>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate('/chat')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Chat
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 relative">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-xl font-semibold">
              {targetUserName ? `Video Call with ${targetUserName}` : `Call: ${callId}`}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>2 participants</span>
              <div className={`w-2 h-2 rounded-full ${
                callStatus === 'connected' ? 'bg-green-500' : 
                callStatus === 'ringing' ? 'bg-yellow-500' :
                callStatus === 'incoming' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}></div>
              <span className="text-xs">
                {callStatus === 'connected' ? 'Connected' :
                 callStatus === 'ringing' ? 'Ringing...' :
                 callStatus === 'incoming' ? 'Incoming Call' :
                 callStatus === 'connecting' ? 'Connecting...' :
                 callStatus === 'waiting' ? 'Waiting for call...' :
                 callStatus === 'rejected' ? 'Call Rejected' :
                 callStatus === 'ended' ? 'Call Ended' :
                 callStatus === 'error' ? 'Error' :
                 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Participants"
            >
              <Users className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleLeaveCall}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              title="Leave Call"
            >
              <PhoneOff className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area - Call Status Based UI */}
      <div className="h-full pt-16 flex relative">
        {/* Remote User Video (Other Person) */}
        <div className="flex-1 bg-gray-800 flex items-center justify-center relative">
          {callStatus === 'incoming' ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                <Phone className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">
                Incoming Call
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                {targetUserName || 'Unknown Caller'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAcceptCall}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Accept
                </button>
                <button
                  onClick={handleRejectCall}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2 transition-colors"
                >
                  <PhoneOff className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          ) : callStatus === 'ringing' ? (
            <div className="text-center">
              <div className="w-32 h-32 bg-yellow-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
                <Phone className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-white text-2xl font-semibold mb-2">
                Calling...
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                {targetUserName || 'Unknown User'}
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          ) : callStatus === 'connected' && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white text-2xl font-bold">
                  {targetUserName ? targetUserName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <h3 className="text-white text-xl font-semibold">
                {targetUserName || 'Remote User'}
              </h3>
              <p className="text-gray-400 text-sm">
                {callStatus === 'connected' ? 'Connected - waiting for video...' : 
                 callStatus === 'connecting' ? 'Connecting...' :
                 callStatus === 'waiting' ? 'Waiting for call...' :
                 'Preparing call...'}
              </p>
              {(callStatus === 'connecting' || callStatus === 'waiting') && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Local User Video (Your Video) - Only show when connected or connecting */}
        {(callStatus === 'connected' || callStatus === 'connecting' || callStatus === 'ringing' || callStatus === 'incoming') && (
          <div className="w-64 h-48 bg-gray-700 absolute bottom-20 right-4 rounded-lg overflow-hidden border-2 border-gray-500">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={true}
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-white text-lg font-bold">You</span>
                  </div>
                  <p className="text-white text-sm">Your video</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute top-16 right-0 w-80 h-full bg-black bg-opacity-90 z-20">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Participants</h3>
            <ul className="text-white">
              <li className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">You</span>
                </div>
                <span>{authUser?.fullName}</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {targetUserName ? targetUserName.charAt(0).toUpperCase() : 'R'}
                  </span>
                </div>
                <span>{targetUserName || 'Remote User'}</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-0 w-80 h-full bg-black bg-opacity-90 z-20">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Audio Input</label>
                <select className="w-full mt-1 bg-gray-700 text-white rounded p-2">
                  <option>Default Microphone</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Video Input</label>
                <select className="w-full mt-1 bg-gray-700 text-white rounded p-2">
                  <option>Default Camera</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm">Audio Output</label>
                <select className="w-full mt-1 bg-gray-700 text-white rounded p-2">
                  <option>Default Speaker</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls - Only show when call is active */}
      {(callStatus === 'connected' || callStatus === 'connecting' || callStatus === 'ringing' || callStatus === 'incoming') && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-6">
          <div className="flex justify-center space-x-4">
            {/* Mute/Unmute Button - Only show when connected */}
            {callStatus === 'connected' && (
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </button>
            )}

            {/* Video On/Off Button - Only show when connected */}
            {callStatus === 'connected' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>
            )}

            {/* Leave Call Button - Always show when call is active */}
            <button
              onClick={handleLeaveCall}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              title="Leave Call"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}