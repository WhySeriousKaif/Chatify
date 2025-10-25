import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, collapseSidebar } = useChatStore();
  const { authUser,onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className="px-3 py-3 rounded-lg cursor-pointer wa-item-hover transition-all duration-200 hover:bg-slate-700/50 hover:scale-[1.02] group"
            onClick={() => { setSelectedUser(chat); collapseSidebar(); }}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-11 rounded-full overflow-hidden">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[var(--wa-text)] text-[15px] font-medium truncate group-hover:text-cyan-300 transition-colors">{chat.fullName}</h4>
                <p className="text-[11px] text-[var(--wa-text-dim)]">{onlineUsers.includes(chat._id) ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ChatList;