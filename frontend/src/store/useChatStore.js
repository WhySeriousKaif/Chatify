import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) || false,
  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", JSON.stringify(!get().isSoundEnabled));
    set({ isSoundEnabled: !get().isSoundEnabled });
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
  getAllContacts:async()=>{
    set({isUsersLoading:true})
    try{
      const response = await axiosInstance.get("/messages/contacts")
      set({allContacts:response.data})
    }catch(error){
      toast.error("Error in getAllContacts:", error)
    }finally{
      set({isUsersLoading:false})
    }
  },
  getMyChatPartners:async()=>{
    set({isUsersLoading:true})
    try{
      const response = await axiosInstance.get("/messages/chats")
      set({chats:response.data})
    }catch(error){
      toast.error("Error in getMyChatPartners:", error)
    }finally{
      set({isUsersLoading:false})
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error("Error fetching messages:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (receiverId, messageData) => {
    try {
      const response = await axiosInstance.post(`/messages/send/${receiverId}`, messageData);
      // Add the new message to the current messages
      set((state) => ({
        messages: [...state.messages, response.data]
      }));
      return response.data;
    } catch (error) {
      toast.error("Error sending message:", error);
      throw error;
    }
  }

}));
