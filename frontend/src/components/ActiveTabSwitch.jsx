import { useChatStore } from "../store/useChatStore";
import { MessageCircleIcon, UsersIcon } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="relative p-2 m-2">
      {/* Background container with gradient border */}
      <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50">
        {/* Animated background for active tab */}
        <div 
          className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg transition-all duration-300 ease-out ${
            activeTab === "chats" ? "left-1" : "left-1/2"
          }`}
        />
        
        {/* Tab buttons */}
        <div className="relative flex">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 relative z-10 ${
              activeTab === "chats" 
                ? "text-cyan-300 shadow-lg" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            <MessageCircleIcon className="w-4 h-4" />
            <span>Chats</span>
            {activeTab === "chats" && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-300 relative z-10 ${
              activeTab === "contacts" 
                ? "text-cyan-300 shadow-lg" 
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            <span>Contacts</span>
            {activeTab === "contacts" && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ActiveTabSwitch;