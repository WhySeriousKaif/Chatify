import { XIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, Video } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

function ChatHeader() {
  const { selectedUser, setSelectedUser, sidebarCollapsed, toggleSidebar, expandSidebar } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const navigate = useNavigate();
  const isOnline = onlineUsers?.some(user => user._id === selectedUser?._id) || false;
  
  // Debug logging
  console.log("ChatHeader - selectedUser:", selectedUser?.fullName, selectedUser?._id);
  console.log("ChatHeader - onlineUsers:", onlineUsers);
  console.log("ChatHeader - isOnline:", isOnline);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  if (!selectedUser) return null;

  return (
    <div
      className="flex justify-between items-center wa-header border-b border-slate-800 h-[64px] px-4 flex-shrink-0"
    >
      <div className="flex items-center space-x-3">
        <div className={`avatar ${onlineUsers?.includes(selectedUser?._id) ? "online" : "offline"}`}>
          <div className="size-12 rounded-full overflow-hidden">
            <img 
              src={selectedUser.profilePic || "/avatar.png"} 
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <h3 className="text-[var(--wa-text)] font-medium text-[15px]">{selectedUser.fullName}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
            <p className="text-[var(--wa-text-dim)] text-[12px]">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Video Call Button */}
        <button
          onClick={() => {
            console.log('🎥 Video call button clicked!');
            // Generate unique call ID based on sorted user IDs for consistent room naming
            const callId = `call-${[authUser._id, selectedUser._id].sort().join('-')}`;
            console.log('📞 Navigating to video call with ID:', callId);
            navigate(`/video-call?userId=${selectedUser._id}&userName=${selectedUser.fullName}&callId=${callId}`);
          }}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
          title={`Start video call with ${selectedUser.fullName}`}
        >
          <Video className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-[var(--wa-item)] rounded-full transition-all duration-200 md:inline-flex inline-flex"
          title={sidebarCollapsed ? "Show chats" : "Hide chats"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpenIcon className="w-5 h-5 text-[var(--wa-text-dim)]" />
          ) : (
            <PanelLeftCloseIcon className="w-5 h-5 text-[var(--wa-text-dim)]" />
          )}
        </button>

        <button 
          onClick={() => { setSelectedUser(null); expandSidebar(); }}
          className="p-2 hover:bg-[var(--wa-item)] rounded-full transition-all duration-200"
        >
          <XIcon className="w-5 h-5 text-[var(--wa-text-dim)] hover:text-red-400 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader