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
    setReplyToMessage,
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
    <div className="flex flex-col h-full relative">
      {/* Beautiful message background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
      
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
                  <div
                    className={`chat-bubble relative rounded-2xl px-4 py-3 text-[14px] leading-relaxed max-w-[75%] shadow-lg transition-all duration-200 hover:shadow-xl backdrop-blur-sm border ${
                      msg.senderId === authUser._id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 border-cyan-400/30 hover:border-cyan-300/50"
                        : "bg-gradient-to-r from-slate-700 to-slate-600 text-slate-100 shadow-slate-700/25 hover:shadow-slate-700/40 border-slate-500/30 hover:border-slate-400/50"
                    }`}
                    onDoubleClick={() => setReplyToMessage(msg)}
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
                    {msg.text && (
                      <span className="inline-block whitespace-pre-wrap break-words">{msg.text}</span>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-[11px] opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
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