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
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          className="px-3 py-2 rounded-lg cursor-pointer wa-item-hover transition-colors"
          onClick={() => { setSelectedUser(chat); collapseSidebar(); }}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-11 rounded-full overflow-hidden">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[var(--wa-text)] text-[15px] font-medium truncate">{chat.fullName}</h4>
              <p className="text-[11px] text-[var(--wa-text-dim)]">{onlineUsers.includes(chat._id) ? "Online" : "Offline"}</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatList;