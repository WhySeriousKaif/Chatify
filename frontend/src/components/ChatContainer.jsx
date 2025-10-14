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
    <div className="flex flex-col h-full">
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-6">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="w-full space-y-2 pr-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'} w-full`}
              >
                <div
                  className={`chat-bubble relative rounded-2xl px-3 py-1.5 text-[14px] leading-relaxed max-w-[75%] ${
                    msg.senderId === authUser._id
                      ? "bg-[var(--wa-outgoing)] text-[var(--wa-text)]"
                      : "bg-[var(--wa-incoming)] text-[var(--wa-text)]"
                  }`}
                  onDoubleClick={() => setReplyToMessage(msg)}
                >
                  {msg.replyTo && (
                    <div className="mb-1 pl-2 pr-1 py-1 border-l-2 border-emerald-400/70 bg-black/10 rounded text-[12px] text-[var(--wa-text-dim)]">
                      {msg.replyTo.text || "Replied message"}
                    </div>
                  )}
                  {msg.image && (
                    <button type="button" className="block group" onClick={() => window.open(msg.image, '_blank')}>
                      <img src={msg.image} alt="Shared" className="rounded-lg max-h-56 object-cover border border-emerald-500/30" />
                    </button>
                  )}
                  {msg.text && <span className="inline-block whitespace-pre-wrap">{msg.text}</span>}
                  <span className="inline-flex items-center gap-1 text-[11px] ml-2 align-baseline text-[var(--wa-text-dim)]">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.senderId === authUser._id && <span className="ml-0.5">✔✔</span>}
                  </span>
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
  );
}

export default ChatContainer;