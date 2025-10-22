import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';

export default function VideoCallPage() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get call parameters from URL
  const targetUserId = searchParams.get('userId');
  const targetUserName = searchParams.get('userName');
  
  // States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState('initializing');
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [error, setError] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  // ICE configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  // Initialize media and socket
  useEffect(() => {
        if (!authUser) {
          navigate('/login');
          return;
        }

    let mounted = true;
    let socketConnection = null;
    let mediaStream = null;

    const initialize = async () => {
      try {
        console.log('🎬 Initializing video call...');
        
        // 1. Get user media first
        console.log('📹 Requesting camera and microphone access...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (!mounted) return;

        console.log('✅ Media stream obtained:', mediaStream.getTracks());
        setLocalStream(mediaStream);

        // Attach to video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        // 2. Initialize socket connection
        console.log('🔌 Connecting to socket server...');
        const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
        socketConnection = io(socketUrl, {
              auth: {
                token: document.cookie.split('token=')[1]?.split(';')[0]
              },
              transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
            });
        
        socketRef.current = socketConnection;
        setSocket(socketConnection);
        
        // Generate call ID
        const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentCallId(callId);

        // 3. Set up socket event handlers
        setupSocketHandlers(socketConnection, mediaStream, callId);

      } catch (err) {
        console.error('❌ Initialization error:', err);
        setError(err.message || 'Failed to initialize video call');
        setCallStatus('error');
      }
    };

    initialize();

    // Cleanup
    return () => {
      mounted = false;
      console.log('🧹 Cleaning up...');
      
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind);
        });
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [authUser, navigate]);

  // Setup socket event handlers
  const setupSocketHandlers = (socketConnection, mediaStream, callId) => {
    // Socket connected
            socketConnection.on('connect', () => {
      console.log('✅ Socket connected');
      setCallStatus('connected_to_server');
              
              if (targetUserId) {
        // Initiate call
        console.log(`📞 Calling user: ${targetUserName} (${targetUserId})`);
                socketConnection.emit('call-user', {
                  targetUserId,
                  callerId: authUser._id,
                  callerName: authUser.fullName,
          callId
                });
        setCallStatus('calling');
              } else {
                setCallStatus('waiting');
              }
            });

    // Socket error
    socketConnection.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      setError('Failed to connect to server');
    });

    // Incoming call
        socketConnection.on('incoming-call', (data) => {
      console.log('📞 Incoming call:', data);
          setCurrentCallId(data.callId);
          setCallStatus('incoming');
        });
        
    // Call accepted
    socketConnection.on('call-accepted', async (data) => {
      console.log('✅ Call accepted:', data);
          setCallStatus('connecting');
      await createPeerConnection(socketConnection, mediaStream, callId, data.fromUserId, true);
    });

    // Start WebRTC
    socketConnection.on('start-webrtc', async (data) => {
      console.log('🔗 Starting WebRTC:', data);
      await createPeerConnection(socketConnection, mediaStream, callId, data.fromUserId, false);
    });

    // WebRTC Offer
        socketConnection.on('webrtc-offer', async (data) => {
      console.log('📨 Received WebRTC offer from:', data.fromUserId);
      await handleOffer(socketConnection, mediaStream, data);
        });
        
    // WebRTC Answer
        socketConnection.on('webrtc-answer', async (data) => {
      console.log('📨 Received WebRTC answer from:', data.fromUserId);
      await handleAnswer(data);
        });
        
    // ICE Candidate
        socketConnection.on('webrtc-ice-candidate', async (data) => {
      console.log('🧊 Received ICE candidate from:', data.fromUserId);
      await handleIceCandidate(data);
    });

    // Call rejected
    socketConnection.on('call-rejected', () => {
      console.log('❌ Call rejected');
      setCallStatus('rejected');
      setTimeout(() => navigate('/chat'), 2000);
    });

    // Call ended
    socketConnection.on('call-ended', () => {
      console.log('📴 Call ended');
      setCallStatus('ended');
      setTimeout(() => navigate('/chat'), 2000);
    });
  };

  // Create peer connection
  const createPeerConnection = async (socketConnection, mediaStream, callId, remoteUserId, shouldCreateOffer) => {
    try {
      console.log('🔗 Creating peer connection...');

      const pc = new RTCPeerConnection(iceServers);
          peerConnectionRef.current = pc;
      
      // Add local stream tracks
      mediaStream.getTracks().forEach(track => {
        pc.addTrack(track, mediaStream);
        console.log('➕ Added track to peer connection:', track.kind);
      });

      // Handle incoming tracks
          pc.ontrack = (event) => {
        console.log('📥 Received remote track:', event.track.kind);
        console.log('📥 Stream:', event.streams[0]);
            
            if (event.streams && event.streams[0]) {
          console.log('✅ Setting remote stream');
              setRemoteStream(event.streams[0]);
              setCallStatus('connected');

          // Attach to video element
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            remoteVideoRef.current.play().catch(e => console.error('Play error:', e));
          }
        }
      };
      
          // Handle ICE candidates
          pc.onicecandidate = (event) => {
            if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
              socketConnection.emit('webrtc-ice-candidate', {
                callId,
                candidate: event.candidate,
                fromUserId: authUser._id,
            toUserId: remoteUserId
              });
            }
          };
      
          // Handle connection state changes
          pc.onconnectionstatechange = () => {
        console.log('🔄 Connection state:', pc.connectionState);
            
            if (pc.connectionState === 'connected') {
          console.log('✅ WebRTC connected!');
              setCallStatus('connected');
        } else if (pc.connectionState === 'disconnected') {
          console.log('⚠️ WebRTC disconnected');
              setCallStatus('disconnected');
        } else if (pc.connectionState === 'failed') {
          console.log('❌ WebRTC connection failed');
          setCallStatus('failed');
        }
      };

      // Handle ICE connection state
          pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
      };

      // Create offer if needed
      if (shouldCreateOffer) {
        console.log('📤 Creating offer...');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        console.log('📤 Sending offer to:', remoteUserId);
        socketConnection.emit('webrtc-offer', {
          callId,
          offer,
          fromUserId: authUser._id,
          toUserId: remoteUserId
        });
      }

    } catch (err) {
      console.error('❌ Error creating peer connection:', err);
      setError('Failed to establish connection');
    }
  };

  // Handle incoming offer
  const handleOffer = async (socketConnection, mediaStream, data) => {
    try {
      console.log('📨 Handling offer...');

      let pc = peerConnectionRef.current;

      // Create peer connection if not exists
      if (!pc) {
        pc = new RTCPeerConnection(iceServers);
          peerConnectionRef.current = pc;
      
        // Add local stream
        mediaStream.getTracks().forEach(track => {
          pc.addTrack(track, mediaStream);
          console.log('➕ Added track:', track.kind);
        });

        // Handle remote tracks
          pc.ontrack = (event) => {
          console.log('📥 Received remote track:', event.track.kind);
            
            if (event.streams && event.streams[0]) {
            console.log('✅ Setting remote stream');
              setRemoteStream(event.streams[0]);
              setCallStatus('connected');

            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
              remoteVideoRef.current.play().catch(e => console.error('Play error:', e));
            }
          }
        };
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('🧊 Sending ICE candidate');
            socketConnection.emit('webrtc-ice-candidate', {
            callId: data.callId,
            candidate: event.candidate,
            fromUserId: authUser._id,
            toUserId: data.fromUserId
          });
        }
      };
      
        // Connection state
          pc.onconnectionstatechange = () => {
          console.log('🔄 Connection state:', pc.connectionState);
            if (pc.connectionState === 'connected') {
              setCallStatus('connected');
          }
        };
      }

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      console.log('✅ Remote description set');

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('📤 Sending answer');
      
      socketConnection.emit('webrtc-answer', {
        callId: data.callId,
        answer,
        fromUserId: authUser._id,
        toUserId: data.fromUserId
      });

    } catch (err) {
      console.error('❌ Error handling offer:', err);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (data) => {
    try {
    const pc = peerConnectionRef.current;
    if (!pc) {
        console.error('❌ No peer connection found');
      return;
    }
    
      console.log('✅ Setting remote description from answer');
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      console.log('✅ Remote description set successfully');

    } catch (err) {
      console.error('❌ Error handling answer:', err);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (data) => {
    try {
    const pc = peerConnectionRef.current;
    if (!pc) {
        console.log('⚠️ No peer connection, skipping ICE candidate');
      return;
    }
    
      console.log('🧊 Adding ICE candidate');
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      console.log('✅ ICE candidate added');

    } catch (err) {
      console.error('❌ Error adding ICE candidate:', err);
    }
  };

  // Accept call
  const handleAcceptCall = () => {
    if (socket && currentCallId) {
      console.log('✅ Accepting call');
      socket.emit('accept-call', {
        callId: currentCallId,
        userId: authUser._id,
        targetUserId: targetUserId
      });
      setCallStatus('connecting');
    }
  };

  // Reject call
  const handleRejectCall = () => {
    if (socket && currentCallId) {
      console.log('❌ Rejecting call');
      socket.emit('reject-call', {
        callId: currentCallId,
        userId: authUser._id
      });
    }
    navigate('/chat');
  };

  // End call
  const handleEndCall = () => {
    if (socket && currentCallId) {
      console.log('📴 Ending call');
      socket.emit('end-call', {
        callId: currentCallId,
        userId: authUser._id
      });
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    navigate('/chat');
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    setIsVideoOff(!isVideoOff);
    }
  };

  // Auto-attach streams to video elements
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('🎥 Attaching remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => {
        console.error('❌ Error playing video:', e);
      });
    }
  }, [remoteStream]);

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/chat')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Back to Chat
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
            <h1 className="text-white text-xl font-semibold">
            {targetUserName ? `Video Call with ${targetUserName}` : 'Video Call'}
            </h1>
          <p className="text-gray-400 text-sm">
            Status: {callStatus}
          </p>
            </div>
            <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
          End Call
                </button>
              </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-4xl">
                  {targetUserName ? targetUserName[0].toUpperCase() : '?'}
                </span>
              </div>
              <p className="text-white text-xl">{targetUserName || 'Waiting...'}</p>
              <p className="text-gray-400">{callStatus}</p>
            </div>
          )}
        </div>
        
        {/* Local Video (Picture-in-Picture) */}
        {localStream && (
          <div className="absolute bottom-20 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-500">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              You
                </div>
              </div>
            )}

        {/* Incoming Call Overlay */}
        {callStatus === 'incoming' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Phone className="w-16 h-16 text-white" />
          </div>
              <h2 className="text-white text-2xl mb-2">Incoming Call</h2>
              <p className="text-gray-300 text-lg mb-8">{targetUserName || 'Unknown'}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleAcceptCall}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Accept
                </button>
                <button
                  onClick={handleRejectCall}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  Reject
                </button>
        </div>
          </div>
        </div>
      )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600`}
              >
                {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
              </button>

              <button
                onClick={toggleVideo}
            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-700'} hover:bg-gray-600`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </button>

            <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
    </div>
  );
}
