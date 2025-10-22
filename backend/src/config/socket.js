import { Server } from "socket.io";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.middleware.js";
import { 
  handleIncomingCall, 
  handleCallAccept, 
  handleCallReject, 
  handleCallEnd,
  handleWebRTCOffer,
  handleWebRTCAnswer,
  handleICECandidate
} from "../controller/webrtc.controller.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  //apply authentication middleware to the socket
  io.use(socketAuthMiddleware);

  // Socket connection handling
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName} (${socket.userId})`);

    // Join user to their own room
    socket.join(socket.userId);

    // Get all connected users and emit to all clients
    const getOnlineUsers = () => {
      const onlineUsers = Array.from(io.sockets.sockets.values())
        .map(socket => ({
          _id: socket.userId,
          fullName: socket.user.fullName,
          profilePic: socket.user.profilePic
        }));
      io.emit("getOnlineUsers", onlineUsers);
    };

    // Emit online users when someone connects
    getOnlineUsers();

    // WebRTC signaling events
    socket.on("call-user", (data) => handleIncomingCall(socket, data));
    socket.on("accept-call", (data) => handleCallAccept(socket, data));
    socket.on("reject-call", (data) => handleCallReject(socket, data));
    socket.on("end-call", (data) => handleCallEnd(socket, data));
    
    // WebRTC peer connection events
    socket.on("webrtc-offer", (data) => handleWebRTCOffer(socket, data));
    socket.on("webrtc-answer", (data) => handleWebRTCAnswer(socket, data));
    socket.on("webrtc-ice-candidate", (data) => handleICECandidate(socket, data));

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.fullName} (${socket.userId})`);
      // Emit updated online users when someone disconnects
      getOnlineUsers();
    });
  });

  return io;
};

// Helper function to get receiver socket ID
export const getReceiverSocketId = (receiverId) => {
  if (!io) return null;
  return Array.from(io.sockets.sockets.values())
    .find(socket => socket.userId === receiverId)?.id;
};

export { io };