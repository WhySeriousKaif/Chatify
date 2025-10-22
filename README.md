# Chatify - Real-Time Chat Application

A modern, full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring WebSocket integration, modern UI design, and secure authentication.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Video Calling**: WebRTC-based video calls with real-time audio/video
- **User Authentication**: Secure JWT-based authentication with cookies
- **Profile Management**: User profiles with image upload via Cloudinary
- **Contact Management**: Add and manage chat contacts
- **Message History**: Persistent message storage and retrieval
- **Online Status**: Real-time online/offline user status
- **Image Sharing**: Send and receive images in chat
- **Message Status**: Read receipts and delivery confirmation
- **Call Controls**: Mute, video toggle, and call management
- **Responsive Design**: Mobile-first responsive UI
- **Sound Notifications**: Audio feedback for new messages
- **Modern UI**: WhatsApp-inspired design with smooth animations

### Technical Features
- **Real-time Communication**: Socket.IO for instant messaging and video calling
- **WebRTC Integration**: Peer-to-peer video/audio communication
- **Secure Authentication**: JWT tokens with HTTP-only cookies
- **File Upload**: Cloudinary integration for image sharing
- **State Management**: Zustand for efficient state management
- **Modern Styling**: Tailwind CSS with custom animations
- **Email Integration**: Resend for welcome emails
- **Security**: Arcjet for rate limiting and security
- **Optimistic Updates**: Instant UI updates for better UX
- **Cross-platform**: Works on desktop, mobile, and tablet devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - Real-time communication and video calling signaling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Resend** - Email service
- **Arcjet** - Security and rate limiting

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Socket.IO Client** - Real-time communication and video calling
- **WebRTC APIs** - Peer-to-peer video/audio communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date utilities

## 📁 Project Structure

```
Chatify/
├── backend/                 # Backend server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   ├── db.js       # MongoDB connection
│   │   │   ├── env.js      # Environment variables
│   │   │   ├── socket.js   # Socket.IO configuration
│   │   │   ├── cloudinary.js # Cloudinary setup
│   │   │   └── utils.js    # Utility functions
│   │   ├── controllers/    # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── message.controller.js
│   │   │   ├── video.controller.js
│   │   │   └── webrtc.controller.js
│   │   ├── middlewares/    # Custom middlewares
│   │   │   ├── auth.middleware.js
│   │   │   └── socket.middleware.js
│   │   ├── models/         # Database models
│   │   │   ├── user.model.js
│   │   │   └── message.model.js
│   │   ├── routes/         # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── message.route.js
│   │   │   └── video.route.js
│   │   ├── emails/         # Email templates
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ProfileHeader.jsx
│   │   │   └── CallInvitation.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── VideoCallPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utility libraries
│   │   ├── hooks/          # Custom hooks
│   │   └── main.jsx        # App entry point
│   └── package.json
├── public/                 # Static assets
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (>=18.0.0)
- npm (>=8.0.0)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Resend account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WhySeriousKaif/Chatify.git
   cd Chatify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Resend (for emails)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your_email@domain.com
   EMAIL_FROM_NAME=Chatify
   
   # Arcjet (for security)
   ARCJET_KEY=your_arcjet_key
   ARCJET_ENV=development
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Available Scripts

#### Root Level
- `npm run dev` - Start backend in development mode
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

#### Backend
- `npm run dev` - Start with nodemon
- `npm start` - Start production server

#### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Usage

### Authentication
1. **Sign Up**: Create a new account with email and password
2. **Login**: Access your account with credentials
3. **Profile**: Update your profile picture and information

### Chatting
1. **Add Contacts**: Browse and add users to your contact list
2. **Start Chat**: Click on any contact to start a conversation
3. **Send Messages**: Type and send text messages
4. **Share Images**: Upload and share images in chat
5. **Real-time Updates**: See messages instantly as they arrive

### Video Calling
1. **Initiate Call**: Click the video button in any chat
2. **Accept/Reject**: Answer incoming video calls
3. **Call Controls**: Mute, toggle video, or leave call
4. **Real-time Video**: See and hear each other in real-time
5. **Call Management**: View call status and participants

### Features
- **Online Status**: See which users are currently online
- **Message History**: View all previous conversations
- **Video Calling**: High-quality video calls with WebRTC
- **Call Controls**: Mute, video toggle, and call management
- **Sound Notifications**: Hear audio alerts for new messages
- **Responsive Design**: Use on desktop, tablet, or mobile

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Arcjet integration for API protection
- **CORS Protection**: Configured for secure cross-origin requests

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/update-profile` - Update user profile

### Messages
- `GET /api/messages/contacts` - Get all contacts
- `GET /api/messages/chats` - Get chat partners
- `GET /api/messages/:userId` - Get messages with specific user
- `POST /api/messages/send/:userId` - Send message to user

### Video Calling
- `POST /api/video/token` - Generate video call token
- Socket events: `call-user`, `accept-call`, `reject-call`, `end-call`
- WebRTC signaling: `webrtc-offer`, `webrtc-answer`, `webrtc-ice-candidate`

## 🎥 Video Calling Architecture

### WebRTC Implementation
- **Peer-to-Peer Connection**: Direct video/audio transmission between users
- **Socket.IO Signaling**: Handles call initiation, acceptance, and rejection
- **STUN Servers**: Google's STUN servers for NAT traversal
- **Real-time Controls**: Mute, video toggle, and call management
- **Cross-platform Support**: Works on all modern browsers and devices

### Call Flow
1. **Call Initiation**: User clicks video button → Socket.IO emits `call-user`
2. **Call Notification**: Target user receives `incoming-call` event
3. **Call Acceptance**: Target user accepts → WebRTC negotiation begins
4. **Media Exchange**: Direct peer-to-peer video/audio streams
5. **Call Management**: Real-time controls and call status updates

### Technical Benefits
- **No External Dependencies**: Built with native WebRTC APIs
- **Cost-free**: No monthly subscription fees
- **High Performance**: Direct peer-to-peer communication
- **Secure**: Encrypted media streams
- **Scalable**: Uses existing Socket.IO infrastructure

## 🎨 UI/UX Features

- **WhatsApp-inspired Design**: Familiar and intuitive interface
- **Video Call Interface**: Modern video calling UI with controls
- **Smooth Animations**: CSS transitions and hover effects
- **Responsive Layout**: Works on all screen sizes
- **Dark Theme**: Modern dark color scheme
- **Custom Components**: Reusable UI components
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or Vercel

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=your_production_frontend_url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**WhySeriousKaif**
- GitHub: [@WhySeriousKaif](https://github.com/WhySeriousKaif)
- Project: [Chatify](https://github.com/WhySeriousKaif/Chatify)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Tailwind CSS for styling
- React team for the amazing framework
- MongoDB for the database
- Cloudinary for image storage
- All open-source contributors

---

**Happy Chatting! 💬**

