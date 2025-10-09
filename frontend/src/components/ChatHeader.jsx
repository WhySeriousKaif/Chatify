import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);

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
      className="flex justify-between items-center bg-slate-800/30 backdrop-blur-md border-b
   border-slate-700/40 max-h-[84px] px-6 flex-1 shadow-lg"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg">
          <img 
            src={selectedUser.profilePic || "/avatar.png"} 
            alt={selectedUser.fullName}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h3 className="text-slate-200 font-semibold text-lg">{selectedUser.fullName}</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            <p className="text-slate-400 text-sm font-medium">{isOnline ? "Online" : "Offline"}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setSelectedUser(null)}
        className="p-2 hover:bg-slate-700/50 rounded-full transition-all duration-200 hover:scale-110"
      >
        <XIcon className="w-5 h-5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" />
      </button>
    </div>
  );
}

export default ChatHeader