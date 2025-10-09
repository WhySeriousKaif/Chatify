import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useChatStore } from "../store/useChatStore";
import PageLoader from "../components/PageLoader";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatList from "../components/ChatList";
import ContactList from "./ContactList";

const ChatPage = () => {
  const { activeTab, selectedUser } = useChatStore();
  const { allContacts, chats, isUsersLoading } = useChatStore();

  return (
    <div className="relative h-screen w-full max-w-6xl m-auto rounded-2xl overflow-hidden">
      <BorderAnimatedContainer>
        {/* left side */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-md border-r border-slate-700/50 p-4 h-full">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>
        {/* right side */}
        <div className="flex-1 flex-col bg-slate-900/50 backdrop-blur-md border-l border-slate-700/50">
          {selectedUser ? <ChatContainer /> :<NoConversationPlaceholder/>}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
};

export default ChatPage;
