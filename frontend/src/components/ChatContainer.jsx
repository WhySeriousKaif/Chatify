import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { Trash2, Heart, ThumbsUp, Laugh, Angry, Smile } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    setReplyToMessage,
    set: setMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showReactions, setShowReactions] = useState(null);

  const handleDeleteMessage = async (messageId) => {
    try {
      console.log('Deleting message:', messageId);
      const response = await axiosInstance.delete(`/messages/delete/${messageId}`);
      console.log('Delete response:', response);
      
      // Update UI immediately as fallback
      const currentMessages = messages;
      const updatedMessages = currentMessages.map(msg => 
        msg._id === messageId 
          ? { ...msg, isDeleted: true, deletedAt: new Date() }
          : msg
      );
      setMessages({ messages: updatedMessages });
      
      toast.success("Message deleted");
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(`Failed to delete message: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReactToMessage = async (messageId, emoji) => {
    try {
      console.log('Reacting to message:', messageId, emoji);
      const response = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      console.log('React response:', response);
      
      // Update UI immediately as fallback
      const currentMessages = messages;
      const updatedMessages = currentMessages.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: response.data.reactions }
          : msg
      );
      setMessages({ messages: updatedMessages });
    } catch (error) {
      console.error('React error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(`Failed to react to message: ${error.response?.data?.message || error.message}`);
    }
  };

  const reactionEmojis = [
    { emoji: "❤️", icon: Heart },
    { emoji: "👍", icon: ThumbsUp },
    { emoji: "😂", icon: Laugh },
    { emoji: "😊", icon: Smile },
    { emoji: "😠", icon: Angry },
  ];

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReactions && !event.target.closest('.reaction-picker')) {
        setShowReactions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactions]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Simple WhatsApp-like background */}
      <div className="absolute inset-0 bg-slate-900" />
      
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader />
        <div className="flex-1 px-4 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {messages.length > 0 && !isMessagesLoading ? (
            <div className="w-full space-y-3 pr-2">
                  {messages.map((msg, index) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {msg.isDeleted ? (
                        <div className="text-slate-500 text-sm italic">
                          This message was deleted
                        </div>
                      ) : (
                        <div
                          className={`chat-bubble relative rounded-2xl px-4 py-3 text-[14px] leading-relaxed max-w-[75%] shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm border ${
                            msg.senderId === authUser._id
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 border-cyan-400/30 hover:border-cyan-300/50"
                              : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 shadow-slate-700/25 hover:shadow-slate-700/40 border-slate-500/30 hover:border-slate-400/50"
                          }`}
                          onDoubleClick={() => {
                            setShowReactions(showReactions === msg._id ? null : msg._id);
                          }}
                        >
                          {msg.replyTo && (
                            <div className="mb-2 pl-3 pr-2 py-2 border-l-3 border-cyan-400/70 bg-black/20 rounded-lg text-[12px] text-slate-300 backdrop-blur-sm">
                              <div className="font-medium text-cyan-300 mb-1">Replying to:</div>
                              {msg.replyTo.text || "Replied message"}
                            </div>
                          )}
                          {msg.image && (
                            <button type="button" className="block group mb-2" onClick={() => window.open(msg.image, '_blank')}>
                              <img 
                                src={msg.image} 
                                alt="Shared" 
                                className="rounded-xl max-h-64 object-cover border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 hover:scale-[1.02] shadow-lg" 
                              />
                            </button>
                          )}
                          {msg.video && (
                            <div className="mb-2">
                              <video 
                                src={msg.video} 
                                controls
                                className="rounded-xl max-h-64 w-full object-cover border-2 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-200 shadow-lg" 
                              />
                            </div>
                          )}
                          {msg.text && (
                            <span className="inline-block whitespace-pre-wrap break-words">{msg.text}</span>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              {msg.reactions && msg.reactions.length > 0 && (
                                <div className="flex gap-1">
                                  {msg.reactions.map((reaction, idx) => (
                                    <span key={idx} className="text-xs">
                                      {reaction.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          
                          {showReactions === msg._id && (
                            <div className="reaction-picker absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-600 rounded-lg p-2 flex gap-1 z-10">
                              {reactionEmojis.map((reaction, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    handleReactToMessage(msg._id, reaction.emoji);
                                    setShowReactions(null);
                                  }}
                                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                              {msg.senderId === authUser._id && (
                                <button
                                  onClick={() => {
                                    handleDeleteMessage(msg._id);
                                    setShowReactions(null);
                                  }}
                                  className="p-1 hover:bg-red-700 rounded transition-colors text-red-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              {/* 👇 scroll target */}
              <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? (
            <MessagesLoadingSkeleton />
          ) : (
            <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
          )}
        </div>

        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;