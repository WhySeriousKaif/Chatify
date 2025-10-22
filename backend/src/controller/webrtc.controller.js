// WebRTC signaling controller for video calls
import { io } from '../config/socket.js';

// Store active calls and peer connections
const activeCalls = new Map();
const peerConnections = new Map();

// Handle incoming call
export const handleIncomingCall = (socket, data) => {
  const { targetUserId, callerId, callerName, callId } = data;
  
  console.log(`Incoming call from ${callerName} (${callerId}) to ${targetUserId}`);
  
  // Store call information
  activeCalls.set(callId, {
    callerId,
    callerName,
    targetUserId,
    status: 'ringing',
    createdAt: new Date()
  });
  
  // Notify target user about incoming call
  socket.to(targetUserId).emit('incoming-call', {
    callId,
    callerId,
    callerName,
    timestamp: new Date()
  });
  
  // Notify caller that call is being sent
  socket.emit('call-sent', {
    callId,
    targetUserId,
    status: 'ringing'
  });
};

// Handle call acceptance
export const handleCallAccept = (socket, data) => {
  const { callId, userId, targetUserId } = data;
  const call = activeCalls.get(callId);
  
  if (!call) {
    socket.emit('call-error', { message: 'Call not found' });
    return;
  }
  
  console.log(`Call ${callId} accepted by ${userId}`);
  
  // Update call status
  call.status = 'accepted';
  call.acceptedAt = new Date();
  
  // Notify caller that call was accepted
  socket.to(call.callerId).emit('call-accepted', {
    callId,
    fromUserId: userId,
    timestamp: new Date()
  });
  
  // Notify both users to start WebRTC negotiation
  socket.emit('start-webrtc', { callId, fromUserId: call.callerId });
  socket.to(call.callerId).emit('start-webrtc', { callId, fromUserId: userId });
};

// Handle call rejection
export const handleCallReject = (socket, data) => {
  const { callId, userId } = data;
  const call = activeCalls.get(callId);
  
  if (!call) {
    socket.emit('call-error', { message: 'Call not found' });
    return;
  }
  
  console.log(`Call ${callId} rejected by ${userId}`);
  
  // Update call status
  call.status = 'rejected';
  call.rejectedAt = new Date();
  
  // Notify caller that call was rejected
  socket.to(call.callerId).emit('call-rejected', {
    callId,
    rejectedBy: userId,
    timestamp: new Date()
  });
  
  // Clean up call
  activeCalls.delete(callId);
};

// Handle call end
export const handleCallEnd = (socket, data) => {
  const { callId, userId } = data;
  const call = activeCalls.get(callId);
  
  if (!call) {
    return;
  }
  
  console.log(`Call ${callId} ended by ${userId}`);
  
  // Update call status
  call.status = 'ended';
  call.endedAt = new Date();
  
  // Notify other participant
  const otherUserId = call.callerId === userId ? call.targetUserId : call.callerId;
  socket.to(otherUserId).emit('call-ended', {
    callId,
    endedBy: userId,
    timestamp: new Date()
  });
  
  // Clean up call and peer connections
  activeCalls.delete(callId);
  peerConnections.delete(callId);
};

// Handle WebRTC offer
export const handleWebRTCOffer = (socket, data) => {
  const { callId, offer, fromUserId, toUserId } = data;
  
  console.log(`WebRTC offer from ${fromUserId} to ${toUserId} for call ${callId}`);
  
  // Forward offer to target user
  socket.to(toUserId).emit('webrtc-offer', {
    callId,
    offer,
    fromUserId
  });
};

// Handle WebRTC answer
export const handleWebRTCAnswer = (socket, data) => {
  const { callId, answer, fromUserId, toUserId } = data;
  
  console.log(`WebRTC answer from ${fromUserId} to ${toUserId} for call ${callId}`);
  
  // Forward answer to target user
  socket.to(toUserId).emit('webrtc-answer', {
    callId,
    answer,
    fromUserId
  });
};

// Handle ICE candidate
export const handleICECandidate = (socket, data) => {
  const { callId, candidate, fromUserId, toUserId } = data;
  
  // Forward ICE candidate to target user
  socket.to(toUserId).emit('webrtc-ice-candidate', {
    callId,
    candidate,
    fromUserId
  });
};

// Get active calls for a user
export const getActiveCalls = (userId) => {
  const userCalls = [];
  for (const [callId, call] of activeCalls.entries()) {
    if (call.callerId === userId || call.targetUserId === userId) {
      userCalls.push({ callId, ...call });
    }
  }
  return userCalls;
};

// Clean up expired calls
export const cleanupExpiredCalls = () => {
  const now = new Date();
  const expiredTime = 5 * 60 * 1000; // 5 minutes
  
  for (const [callId, call] of activeCalls.entries()) {
    if (now - call.createdAt > expiredTime && call.status === 'ringing') {
      console.log(`Cleaning up expired call ${callId}`);
      activeCalls.delete(callId);
    }
  }
};

// Run cleanup every minute
setInterval(cleanupExpiredCalls, 60000);
