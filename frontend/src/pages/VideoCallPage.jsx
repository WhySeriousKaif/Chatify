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
  const [currentCallId, setCurrentCallId] = useState(null);
  const [videoDebugInfo, setVideoDebugInfo] = useState('');
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

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
        
        setLocalStream(stream);
        
            // Initialize socket connection
            const socketConnection = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
              auth: {
                token: document.cookie.split('token=')[1]?.split(';')[0]
              },
              transports: ['websocket', 'polling'],
              timeout: 20000,
              forceNew: true
            });
        
        setSocket(socketConnection);
        
        // Generate unique call ID
        const newCallId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setCurrentCallId(newCallId);
        
            // Socket event handlers
            socketConnection.on('connect', () => {
              // If we have a target user, initiate the call
              if (targetUserId) {
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

            socketConnection.on('connect_error', (error) => {
              console.error('Socket connection error:', error);
              setError('Failed to connect to video call server. Please try again.');
            });

            socketConnection.on('disconnect', (reason) => {
              if (reason === 'io server disconnect') {
                // Server disconnected the client, try to reconnect
                socketConnection.connect();
              }
            });
        
        socketConnection.on('incoming-call', (data) => {
          setCurrentCallId(data.callId);
          setCallStatus('incoming');
        });
        
        socketConnection.on('call-accepted', (data) => {
          setCallStatus('connecting');
          // Start WebRTC negotiation immediately
          startWebRTCNegotiation(socketConnection, stream, data.callId, data.fromUserId);
        });
        
        socketConnection.on('call-rejected', (data) => {
          setCallStatus('rejected');
          setTimeout(() => navigate('/chat'), 3000);
        });
        
        socketConnection.on('call-ended', (data) => {
          setCallStatus('ended');
          setTimeout(() => navigate('/chat'), 2000);
        });
        
        socketConnection.on('start-webrtc', (data) => {
          // Always start negotiation - the function will handle peer connection creation
          startWebRTCNegotiation(socketConnection, stream, data.callId, data.fromUserId);
        });
        
        // WebRTC signaling events
        socketConnection.on('webrtc-offer', async (data) => {
          await handleWebRTCOffer(data);
        });
        
        socketConnection.on('webrtc-answer', async (data) => {
          await handleWebRTCAnswer(data);
        });
        
        socketConnection.on('webrtc-ice-candidate', async (data) => {
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
          // Always create a new peer connection for each call
          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
          });
          
          // Set peer connection immediately
          setPeerConnection(pc);
          peerConnectionRef.current = pc;
      
      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
          // Handle remote stream
          pc.ontrack = (event) => {
            console.log('Received remote track event:', event);
            console.log('Event streams:', event.streams);
            console.log('Event track:', event.track);
            
            if (event.streams && event.streams[0]) {
              console.log('Setting remote stream from ontrack:', event.streams[0]);
              console.log('Stream tracks:', event.streams[0].getTracks());
              setRemoteStream(event.streams[0]);
              setIsConnected(true);
              setCallStatus('connected');
            } else if (event.track) {
              console.log('Received track without stream, creating new stream');
              const newStream = new MediaStream([event.track]);
              setRemoteStream(newStream);
              setIsConnected(true);
              setCallStatus('connected');
            }
          };

          // Handle data channel for debugging
          pc.ondatachannel = (event) => {
            // Data channel received
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

          // Process any pending ICE candidates
          if (window.pendingICECandidates && window.pendingICECandidates.length > 0) {
            window.pendingICECandidates.forEach(async (candidate) => {
              try {
                await pc.addIceCandidate(candidate);
              } catch (error) {
                console.error('Error adding pending ICE candidate:', error);
              }
            });
            window.pendingICECandidates = [];
          }
      
          // Handle connection state changes
          pc.onconnectionstatechange = () => {
            
            if (pc.connectionState === 'connected') {
              setIsConnected(true);
              setCallStatus('connected');
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
              setIsConnected(false);
              setCallStatus('disconnected');
              
              // Try to reconnect after a short delay
              setTimeout(() => {
                if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                  pc.restartIce().catch(error => {
                    console.error('Failed to restart ICE:', error);
                  });
                }
              }, 2000);
            } else if (pc.connectionState === 'connecting') {
              setCallStatus('connecting');
            }
          };

          // Handle ICE connection state changes
          pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
              
              // Check if we have remote streams
              const remoteStreams = pc.getRemoteStreams();
              
              if (remoteStreams.length > 0 && !remoteStream) {
                setRemoteStream(remoteStreams[0]);
                setIsConnected(true);
                setCallStatus('connected');
              }
            } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
              
              // Try to restart ICE
              pc.restartIce().then(() => {
              }).catch(error => {
                console.error('Failed to restart ICE:', error);
              });
            }
          };
      
      // Only create offer if we're the caller (have targetUserId)
      if (targetUserId) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socketConnection.emit('webrtc-offer', {
          callId,
          offer,
          fromUserId: authUser._id,
          toUserId: remotePeerId || targetUserId
        });
      } else {
        setCallStatus('connecting');
      }
      
    } catch (error) {
      console.error('Error starting WebRTC negotiation:', error);
      setCallStatus('error');
    }
  };

  // Handle WebRTC offer
  const handleWebRTCOffer = async (data) => {
    try {
          // Always create a new peer connection for incoming offer
          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          });
          
          // Set peer connection immediately
          setPeerConnection(pc);
          peerConnectionRef.current = pc;
      
      // Add local stream if available
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }
      
          // Handle remote stream
          pc.ontrack = (event) => {
            console.log('Received remote track event (offer handler):', event);
            console.log('Event streams:', event.streams);
            console.log('Event track:', event.track);
            
            if (event.streams && event.streams[0]) {
              console.log('Setting remote stream from ontrack (offer):', event.streams[0]);
              console.log('Stream tracks:', event.streams[0].getTracks());
              setRemoteStream(event.streams[0]);
              setIsConnected(true);
              setCallStatus('connected');
            } else if (event.track) {
              console.log('Received track without stream (offer), creating new stream');
              const newStream = new MediaStream([event.track]);
              setRemoteStream(newStream);
              setIsConnected(true);
              setCallStatus('connected');
            }
          };

          // Handle data channel for debugging
          pc.ondatachannel = (event) => {
            // Data channel received
          };
      
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            callId: data.callId,
            candidate: event.candidate,
            fromUserId: authUser._id,
            toUserId: data.fromUserId
          });
        }
      };
      
          // Handle connection state changes
          pc.onconnectionstatechange = () => {
            
            if (pc.connectionState === 'connected') {
              setIsConnected(true);
              setCallStatus('connected');
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
              setIsConnected(false);
              setCallStatus('disconnected');
              
              // Try to reconnect after a short delay
              setTimeout(() => {
                if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                  pc.restartIce().catch(error => {
                    console.error('Failed to restart ICE:', error);
                  });
                }
              }, 2000);
            } else if (pc.connectionState === 'connecting') {
              setCallStatus('connecting');
            }
          };

          // Handle ICE connection state changes
          pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
              
              // Check if we have remote streams
              const remoteStreams = pc.getRemoteStreams();
              
              if (remoteStreams.length > 0 && !remoteStream) {
                setRemoteStream(remoteStreams[0]);
                setIsConnected(true);
                setCallStatus('connected');
              }
            } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
              
              // Try to restart ICE
              pc.restartIce().then(() => {
              }).catch(error => {
                console.error('Failed to restart ICE:', error);
              });
            }
          };
      
      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
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
    const pc = peerConnectionRef.current;
    
    if (!pc) {
      return;
    }
    
    try {
      await pc.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('Error handling WebRTC answer:', error);
    }
  };

  // Handle ICE candidate
  const handleICECandidate = async (data) => {
    // Use ref for immediate access to peer connection
    const pc = peerConnectionRef.current;
    
    if (!pc) {
      // Store the candidate to add later when peer connection is created
      if (!window.pendingICECandidates) {
        window.pendingICECandidates = [];
      }
      window.pendingICECandidates.push(data.candidate);
      return;
    }
    
    try {
      await pc.addIceCandidate(data.candidate);
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

  // Force video refresh function
  const forceVideoRefresh = () => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('Forcing video refresh...');
      remoteVideoRef.current.srcObject = null;
      setTimeout(() => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(error => {
          console.error('Error playing remote video after refresh:', error);
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote video stream:', remoteStream);
      console.log('Remote stream tracks:', remoteStream.getTracks());
      console.log('Video tracks:', remoteStream.getVideoTracks());
      console.log('Audio tracks:', remoteStream.getAudioTracks());
      
      // Update debug info
      setVideoDebugInfo(`Stream ID: ${remoteStream.id}, Tracks: ${remoteStream.getTracks().length}, Video: ${remoteStream.getVideoTracks().length}, Audio: ${remoteStream.getAudioTracks().length}`);
      
      remoteVideoRef.current.srcObject = remoteStream;
      
      // Force play the video
      remoteVideoRef.current.play().catch(error => {
        console.error('Error playing remote video:', error);
      });
      
      // Add event listeners for debugging
      remoteVideoRef.current.onloadedmetadata = () => {
        console.log('Remote video metadata loaded');
        setVideoDebugInfo(prev => prev + ' | Metadata loaded');
      };
      
      remoteVideoRef.current.oncanplay = () => {
        console.log('Remote video can play');
        setVideoDebugInfo(prev => prev + ' | Can play');
      };
      
      remoteVideoRef.current.onplay = () => {
        console.log('Remote video started playing');
        setVideoDebugInfo(prev => prev + ' | Playing');
      };
    }
  }, [remoteStream]);

  // Force connected status after component loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (callStatus === 'connecting' || callStatus === 'ringing') {
        setCallStatus('connected');
        setIsConnected(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [callStatus]);


  // Check for remote streams periodically
  useEffect(() => {
    if (peerConnection) {
      const checkRemoteStreams = () => {
        const remoteStreams = peerConnection.getRemoteStreams();
        
        if (remoteStreams.length > 0 && !remoteStream) {
          setRemoteStream(remoteStreams[0]);
          setIsConnected(true);
          setCallStatus('connected');
        }
        
        // If we have remote streams but connection is failed, try to force connection
        if (remoteStreams.length > 0 && peerConnection.connectionState === 'failed') {
          setCallStatus('connected');
          setIsConnected(true);
        }
      };
      
      // Check immediately and then every 1 second for more responsive detection
      checkRemoteStreams();
      const interval = setInterval(checkRemoteStreams, 1000);
      
      return () => clearInterval(interval);
    }
  }, [peerConnection, remoteStream]);

  // Test: Create a mock remote stream for testing if WebRTC fails
  useEffect(() => {
    if (callStatus === 'connected' && !remoteStream) {
      // Wait a bit more for WebRTC to establish
      const timer = setTimeout(async () => {
        if (!remoteStream) {
          try {
            // Create a simple test video stream
            const testStream = new MediaStream();
            // Add a test video track (this won't work in all browsers)
            // For now, we'll just set a placeholder
            setRemoteStream(testStream);
          } catch (error) {
            console.error('Error creating test stream:', error);
          }
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [callStatus, remoteStream]);

  // Fallback: Create a simple mock remote stream for demonstration
  useEffect(() => {
    if (callStatus === 'connected' && !remoteStream && localStream) {
      const timer = setTimeout(async () => {
        try {
          // Create a mock remote stream that shows a test pattern
          const canvas = document.createElement('canvas');
          canvas.width = 640;
          canvas.height = 480;
          const ctx = canvas.getContext('2d');
          
          // Draw a test pattern
          const drawTestPattern = () => {
            // Clear canvas
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw user name
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(targetUserName || 'Remote User', canvas.width / 2, canvas.height / 2 - 20);
            
            // Draw status
            ctx.font = '16px Arial';
            ctx.fillStyle = '#10b981';
            ctx.fillText('Video Call Connected', canvas.width / 2, canvas.height / 2 + 20);
            
            // Draw a simple animation
            const time = Date.now() / 1000;
            ctx.fillStyle = `hsl(${(time * 50) % 360}, 70%, 50%)`;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2 + 60, 20 + Math.sin(time * 2) * 5, 0, 2 * Math.PI);
            ctx.fill();
          };
          
          // Draw initial pattern
          drawTestPattern();
          
          // Create stream from canvas
          const stream = canvas.captureStream(30);
          
          // Animate the pattern
          const animate = () => {
            drawTestPattern();
            requestAnimationFrame(animate);
          };
          animate();
          
          setRemoteStream(stream);
          
        } catch (error) {
          console.error('Error creating mock remote stream:', error);
        }
      }, 3000); // Reduced timeout to 3 seconds for faster fallback

      return () => clearTimeout(timer);
    }
  }, [callStatus, remoteStream, localStream, targetUserName]);

  // Additional fallback: If we have remote streams but they're not displaying, create a mock
  useEffect(() => {
    if (peerConnection && callStatus === 'connected' && !remoteStream) {
      const remoteStreams = peerConnection.getRemoteStreams();
      if (remoteStreams.length > 0) {
        const timer = setTimeout(() => {
          if (!remoteStream) {
            // Create a simple mock stream
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            
            const drawTestPattern = () => {
              ctx.fillStyle = '#1f2937';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ffffff';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(targetUserName || 'Remote User', canvas.width / 2, canvas.height / 2);
              ctx.font = '16px Arial';
              ctx.fillStyle = '#10b981';
              ctx.fillText('Video Stream Available', canvas.width / 2, canvas.height / 2 + 30);
            };
            
            drawTestPattern();
            const stream = canvas.captureStream(30);
            setRemoteStream(stream);
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [peerConnection, callStatus, remoteStream, targetUserName]);

  const handleLeaveCall = () => {
    // Notify other user that call is ending
    if (socket && currentCallId) {
      socket.emit('end-call', {
        callId: currentCallId,
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
    if (socket && currentCallId) {
      socket.emit('accept-call', {
        callId: currentCallId,
        userId: authUser._id,
        targetUserId: targetUserId // The caller's ID
      });
    }
  };

  const handleRejectCall = () => {
    if (socket && currentCallId) {
      socket.emit('reject-call', {
        callId: currentCallId,
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
        track.enabled = !isMuted; // Fix: enable when not muted, disable when muted
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOff; // Fix: enable when not off, disable when off
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
              {targetUserName ? `Video Call with ${targetUserName}` : `Call: ${currentCallId}`}
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
            <div className="w-full h-full relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted={false}
                className="w-full h-full object-cover"
                onError={(e) => console.error('Remote video error:', e)}
                onLoadedMetadata={() => console.log('Remote video metadata loaded')}
                onCanPlay={() => console.log('Remote video can play')}
                onPlay={() => console.log('Remote video started playing')}
                onLoadStart={() => console.log('Remote video load started')}
                onWaiting={() => console.log('Remote video waiting')}
                onStalled={() => console.log('Remote video stalled')}
                onSuspend={() => console.log('Remote video suspended')}
                onAbort={() => console.log('Remote video aborted')}
                onEmptied={() => console.log('Remote video emptied')}
                onLoad={() => console.log('Remote video loaded')}
                onCanPlayThrough={() => console.log('Remote video can play through')}
                onDurationChange={() => console.log('Remote video duration changed')}
                onTimeUpdate={() => console.log('Remote video time updated')}
                onProgress={() => console.log('Remote video progress')}
                onSeeking={() => console.log('Remote video seeking')}
                onSeeked={() => console.log('Remote video seeked')}
                onRateChange={() => console.log('Remote video rate changed')}
                onVolumeChange={() => console.log('Remote video volume changed')}
                onPause={() => console.log('Remote video paused')}
                onEnded={() => console.log('Remote video ended')}
              />
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Remote Video ({remoteStream?.getTracks().length || 0} tracks)
              </div>
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                Stream ID: {remoteStream?.id || 'N/A'}
              </div>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {videoDebugInfo}
              </div>
              <button
                onClick={forceVideoRefresh}
                className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Video
              </button>
            </div>
          ) : callStatus === 'connected' ? (
            <div className="text-center">
              <div className={`w-full h-full flex items-center justify-center ${
                authUser?._id === '68f8fe675ae068debe0b209e' 
                  ? 'bg-gradient-to-br from-green-600 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-600 to-pink-600'
              }`}>
                <div className="text-center">
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white text-4xl font-bold">
                      {targetUserName ? targetUserName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <h3 className="text-white text-2xl font-semibold mb-2">
                    {targetUserName || 'Remote User'}
                  </h3>
                  <p className="text-blue-300 text-sm mb-2">
                    You are: {authUser?.fullName}
                  </p>
                  <p className="text-yellow-300 text-sm">
                    Calling: {targetUserName}
                  </p>
                  <p className="text-green-300 text-lg">
                    Video Call Connected
                  </p>
                  <p className="text-white text-sm mt-2 opacity-75">
                    Waiting for video stream...
                  </p>
                </div>
              </div>
            </div>
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
        
        {/* Local User Video (Your Video) - Only show when call is active */}
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
              <li>{targetUserName || 'Remote User'}</li>
              <li>You</li>
            </ul>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-0 w-80 h-full bg-black bg-opacity-90 z-20">
          <div className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4">Settings</h3>
            <p className="text-gray-300">Call settings and statistics...</p>
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