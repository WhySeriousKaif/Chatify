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
import ChatContainer from "../components/ChatContainer";


const ChatPage = () => {
  const { activeTab, selectedUser, sidebarCollapsed } = useChatStore();
  const { allContacts, chats, isUsersLoading } = useChatStore();

  return (
    <div className="relative h-screen w-full bg-slate-900">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f62e_1px,transparent_1px),linear-gradient(to_bottom,#3b82f62e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-purple-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
      
      <div className="relative h-screen w-full md:max-w-6xl md:m-auto rounded-none md:rounded-2xl overflow-hidden py-0 md:py-6 z-10">
        <BorderAnimatedContainer>
        {/* left side */}
        <div className={`${sidebarCollapsed ? 'w-0 md:w-0' : 'w-full md:w-80'} wa-sidebar border-r border-slate-800 p-0 h-full md:rounded-l-2xl transition-all duration-300 overflow-hidden ${sidebarCollapsed ? '' : 'absolute inset-0 md:relative z-20'} flex flex-col`}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {activeTab === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>
        {/* right side */}
        <div className={`${sidebarCollapsed ? 'flex' : 'hidden md:flex'} flex-1 flex-col wa-wallpaper border-l border-slate-800 md:rounded-r-2xl` }>
          {selectedUser ? <ChatContainer /> :<NoConversationPlaceholder/>}
        </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
};

export default ChatPage;
