# Chatify Frontend - React Application

A modern, responsive React frontend for the Chatify real-time chat application, built with Vite, Tailwind CSS, and Zustand for state management.

## 🏗️ Architecture Overview

The frontend follows a component-based architecture with clear separation of concerns:

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── store/          # Zustand state management
│   ├── lib/            # Utility libraries
│   ├── hooks/          # Custom React hooks
│   ├── main.jsx        # Application entry point
│   └── App.jsx         # Main app component
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>=18.0.0)
- npm (>=8.0.0)
- Backend server running on port 3000

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎨 UI Components

### Core Components

#### App Component (`App.jsx`)
Main application component with routing and authentication.

```jsx
function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="h-screen w-screen wa-app wa-wallpaper relative overflow-hidden">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={authUser ? <Navigate to="/chat" /> : <LogInPage />} />
        <Route path="/signup" element={authUser ? <Navigate to="/chat" /> : <SignUpPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}
```

#### ChatPage Component (`pages/ChatPage.jsx`)
Main chat interface with sidebar and chat container.

```jsx
const ChatPage = () => {
  const { activeTab, selectedUser, sidebarCollapsed } = useChatStore();
  const { allContacts, chats, isUsersLoading } = useChatStore();

  return (
    <div className="relative h-screen w-full md:max-w-6xl md:m-auto rounded-none md:rounded-2xl overflow-hidden py-0 md:py-6">
      <BorderAnimatedContainer>
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-0 md:w-0' : 'w-full md:w-80'} wa-sidebar border-r border-slate-800 p-0 h-full md:rounded-l-2xl transition-all duration-300 overflow-hidden`}>
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {activeTab === "chats" ? <ChatList /> : <ContactList />}
          </div>
        </div>
        
        {/* Chat Container */}
        <div className={`${sidebarCollapsed ? 'flex' : 'hidden md:flex'} flex-1 flex-col wa-wallpaper border-l border-slate-800 md:rounded-r-2xl`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
};
```

### UI Components

#### ChatContainer (`components/ChatContainer.jsx`)
Main chat interface with message display and input.

**Features:**
- Real-time message display
- Auto-scroll to latest messages
- Message status indicators
- Image message support
- Reply functionality
- Loading states

```jsx
const ChatContainer = () => {
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
    return () => unsubscribeFromMessages();
  }, [selectedUser]);

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
              <div key={msg._id} className={`flex ${msg.senderId === authUser._id ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`chat-bubble relative rounded-2xl px-3 py-1.5 text-[14px] leading-relaxed max-w-[75%] ${
                  msg.senderId === authUser._id
                    ? "bg-[var(--wa-outgoing)] text-[var(--wa-text)]"
                    : "bg-[var(--wa-incoming)] text-[var(--wa-text)]"
                }`}>
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
};
```

#### MessageBubble (`components/MessageBubble.jsx`)
Individual message display component.

**Features:**
- Sender/receiver styling
- Time formatting
- Image message support
- Message status indicators
- Click to reply functionality

```jsx
const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
            <img 
              src={message.sender?.profilePic || "/avatar.png"} 
              alt={message.sender?.fullName || "User"}
              className='w-full h-full object-cover'
            />
          </div>
        )}
        <div className={`relative px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
            : 'bg-slate-700 text-slate-200'
        }`}>
          {message.text && (
            <p className='text-sm leading-relaxed break-words'>{message.text}</p>
          )}
          {message.image && (
            <div className='mt-2'>
              <img 
                src={message.image} 
                alt="Shared image"
                className='max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                onClick={() => window.open(message.image, '_blank')}
              />
            </div>
          )}
          <div className={`text-xs mt-1 ${
            isOwn ? 'text-cyan-100' : 'text-slate-400'
          }`}>
            {formatTime(message.createdAt)}
          </div>
          {isOwn && (
            <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
              <svg className='w-2 h-2 text-white' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 🗃️ State Management

### Authentication Store (`store/useAuthStore.js`)
Zustand store for user authentication and socket management.

```javascript
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    try {
      set({ isSigningUp: true });
      const response = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: response.data.savedUser });
      toast.success("Signup successful");
      get().connectSocket();
    } catch (error) {
      toast.error("Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    try {
      set({ isLoggingIn: true });
      const response = await axiosInstance.post("/auth/login", formData);
      set({ authUser: response.data.user });
      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      toast.error("Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    
    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null });
  },
}));
```

### Chat Store (`store/useChatStore.js`)
Zustand store for chat functionality and message management.

```javascript
export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  sidebarCollapsed: false,
  replyToMessage: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      replyTo: get().replyToMessage ? { 
        _id: get().replyToMessage._id, 
        text: get().replyToMessage.text 
      } : undefined,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage], replyToMessage: null });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });
  },
}));
```

## 🎨 Styling and Design

### Tailwind CSS Configuration
The application uses Tailwind CSS with custom configurations:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### Custom CSS Variables
```css
:root {
  --wa-outgoing: #00a884;
  --wa-incoming: #202c33;
  --wa-text: #e9edef;
  --wa-text-dim: #8696a0;
  --wa-wallpaper: #111b21;
  --wa-sidebar: #202c33;
}
```

### Component Styling Patterns
- **Responsive Design**: Mobile-first approach with `md:` breakpoints
- **Dark Theme**: Consistent dark color scheme
- **Smooth Animations**: CSS transitions and transforms
- **Custom Components**: Reusable styled components

## 🔌 API Integration

### Axios Configuration (`lib/axios.js`)
```javascript
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
```

### API Calls
All API calls are centralized in the store methods:

```javascript
// Authentication
const response = await axiosInstance.post("/auth/signup", formData);
const response = await axiosInstance.post("/auth/login", formData);
const response = await axiosInstance.get("/auth/check");

// Messages
const response = await axiosInstance.get("/messages/contacts");
const response = await axiosInstance.get("/messages/chats");
const response = await axiosInstance.get(`/messages/${userId}`);
const response = await axiosInstance.post(`/messages/send/${userId}`, messageData);
```

## 🔌 Socket.IO Integration

### Socket Connection
```javascript
const socket = io(BASE_URL, {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("getOnlineUsers", (users) => {
  set({ onlineUsers: users });
});

socket.on("newMessage", (newMessage) => {
  // Handle new message
});
```

### Real-time Features
- **Online Status**: Track online/offline users
- **Message Delivery**: Real-time message updates
- **Sound Notifications**: Audio alerts for new messages
- **Optimistic Updates**: Instant UI updates

## 🎵 Audio Features

### Sound Management
```javascript
// Sound toggle functionality
toggleSound: () => {
  localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
  set({ isSoundEnabled: !get().isSoundEnabled });
},

// Play notification sound
if (isSoundEnabled) {
  const notificationSound = new Audio("/sounds/notification.mp3");
  notificationSound.currentTime = 0;
  notificationSound.play().catch((e) => console.log("Audio play failed:", e));
}
```

### Available Sounds
- `notification.mp3` - New message notification
- `keystroke1.mp3` - Typing sound 1
- `keystroke2.mp3` - Typing sound 2
- `keystroke3.mp3` - Typing sound 3
- `keystroke4.mp3` - Typing sound 4
- `mouse-click.mp3` - Click sound

## 📱 Responsive Design

### Breakpoints
- **Mobile**: Default styles (0px+)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)

### Mobile-First Approach
```jsx
<div className="w-full md:w-80 lg:w-96">
  {/* Mobile: full width, Tablet+: fixed width */}
</div>

<div className="hidden md:flex">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

<div className="flex md:hidden">
  {/* Visible on mobile, hidden on tablet+ */}
</div>
```

## 🚀 Performance Optimizations

### Code Splitting
- Route-based code splitting with React.lazy()
- Component-level lazy loading
- Dynamic imports for heavy components

### State Management
- Zustand for efficient state updates
- Optimistic updates for better UX
- Proper cleanup of event listeners

### Memory Management
- useEffect cleanup functions
- Socket connection cleanup
- Event listener removal

## 🧪 Testing

### Component Testing
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Real-time messaging
- [ ] Image sharing
- [ ] Online status updates
- [ ] Sound notifications
- [ ] Responsive design
- [ ] Error handling

## 🚀 Build and Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment
The frontend can be deployed to:
- **Vercel**: Automatic deployments from Git
- **Netlify**: Drag and drop or Git integration
- **GitHub Pages**: Static site hosting
- **AWS S3**: Static website hosting
- **Firebase Hosting**: Google's hosting platform

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.4",
  "axios": "^1.12.2",
  "socket.io-client": "^4.8.1",
  "zustand": "^5.0.3",
  "react-hot-toast": "^2.6.0"
}
```

### Styling Dependencies
```json
{
  "tailwindcss": "^4.1.14",
  "@tailwindcss/vite": "^4.1.14",
  "daisyui": "^5.1.29"
}
```

### Utility Dependencies
```json
{
  "date-fns": "^4.1.0",
  "lucide-react": "^0.545.0"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^5.0.4",
  "vite": "^7.1.7",
  "eslint": "^9.36.0"
}
```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### ESLint Configuration (`eslint.config.js`)
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## 🎯 Key Features Implementation

### Real-time Messaging
- Socket.IO client integration
- Message state management
- Optimistic updates
- Message status indicators

### User Interface
- WhatsApp-inspired design
- Responsive layout
- Dark theme
- Smooth animations

### State Management
- Zustand stores
- Persistent state
- Optimistic updates
- Real-time synchronization

### Authentication
- JWT token handling
- Automatic token refresh
- Protected routes
- User session management

---

**Frontend Development Complete! 🚀**

For backend documentation, see the `backend/README.md` file.
For the main project overview, see the root `README.md` file.