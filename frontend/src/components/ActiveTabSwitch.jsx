import { useChatStore } from "../store/useChatStore";
import { MessageCircleIcon, UsersIcon } from "lucide-react";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="px-2 pt-2">
      {/* Background container */}
      <div className="relative rounded-lg p-1 border border-slate-800 bg-[var(--wa-panel)]">
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 relative z-10 ${
              activeTab === "chats" 
                ? "text-[var(--wa-text)] bg-[var(--wa-item-hover)]" 
                : "text-[var(--wa-text-dim)] hover:bg-[var(--wa-item)]"
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
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all duration-300 relative z-10 ${
              activeTab === "contacts" 
                ? "text-[var(--wa-text)] bg-[var(--wa-item-hover)]" 
                : "text-[var(--wa-text-dim)] hover:bg-[var(--wa-item)]"
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