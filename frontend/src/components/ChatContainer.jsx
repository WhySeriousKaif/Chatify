import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();
    }

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === authUser?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar for other user's messages */}
                    {!isOwnMessage && (
                      <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                        <img 
                          src={msg.sender?.profilePic || "/avatar.png"} 
                          alt={msg.sender?.fullName || "User"}
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        isOwnMessage 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25' 
                          : 'bg-slate-700/80 backdrop-blur-sm text-slate-200 border border-slate-600/30'
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-2 group">
                          <img 
                            src={msg.image} 
                            alt="Shared" 
                            className="rounded-xl max-w-full h-auto max-h-64 object-contain cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl" 
                            onClick={() => window.open(msg.image, '_blank')}
                            style={{ 
                              imageOrientation: 'from-image',
                              transform: 'none'
                            }}
                            onLoad={(e) => {
                              // Reset any potential orientation issues
                              e.target.style.transform = 'none';
                              e.target.style.imageOrientation = 'from-image';
                            }}
                          />
                        </div>
                      )}
                      {msg.text && <p className="break-words">{msg.text}</p>}
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-cyan-100' : 'text-slate-400'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                    </div>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      {/* Message input - fixed at bottom */}
      <div className="flex-shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer
