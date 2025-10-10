import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ authUser: null, isCheckingAuth: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (formData) => {
    try {
      set({ isSigningUp: true });
      const response = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: response.data.savedUser });
      toast.success("Signup successful");
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ isSigningUp: false });
      toast.error("Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
    try {
      set({ isLoggingIn: true });
      const response = await axiosInstance.post("/auth/login", formData);
      set({ authUser: response.data.user });
      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ isLoggingIn: false });
      toast.error("Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      set({ isLoggingOut: true });
      const response = await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (error) {
      console.log(error);
      set({ isLoggingOut: false });
      toast.error("Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },
  updateProfile: async (profileData) => {
    try {
      set({ isUpdatingProfile: true });
      const response = await axiosInstance.post(
        "/auth/update-profile",
        profileData
      );
      set({ authUser: response.data });
      toast.success("Profile updated successfully");
      get().connectSocket();
    } catch (error) {
      console.log(error);
      toast.error("Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      console.log("Socket connection skipped:", { authUser: !!authUser, connected: get().socket?.connected });
      return;
    }
    
    console.log("Connecting socket for user:", authUser.fullName);
    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error.message);
    });

    socket.connect();
    set({ socket });

    //    listen for online users
    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
    socket.on("user-status-updated", (updatedUser) => {
      set({
        onlineUsers: get().onlineUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        ),
      });
    });
    socket.on("disconnect", () => {
      set({
        onlineUsers: get().onlineUsers.filter(
          (user) => user._id !== authUser._id
        ),
      });
    });
  },
  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
}));
