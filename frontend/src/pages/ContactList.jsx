import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "../components/UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { MessageCircleIcon, UserPlusIcon } from "lucide-react";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, collapseSidebar } = useChatStore();
  const { authUser,onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  if (allContacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
          <UserPlusIcon className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h4 className="text-slate-200 font-medium mb-1">No contacts found</h4>
          <p className="text-slate-400 text-sm">All users are already in your chats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircleIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="text-slate-200 font-medium">All Contacts</h3>
      </div>
      
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="group bg-slate-700/30 hover:bg-cyan-500/10 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 border border-slate-600/30 hover:border-cyan-500/50 backdrop-blur-sm"
          onClick={() => { setSelectedUser(contact); collapseSidebar(); }}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers?.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full overflow-hidden">
                <img 
                  src={contact.profilePic || "/avatar.png"} 
                  alt={contact.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate group-hover:text-cyan-300 transition-colors">
                {contact.fullName}
              </h4>
              <p className="text-slate-400 text-sm truncate">
                {contact.email}
              </p>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <MessageCircleIcon className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default ContactList;