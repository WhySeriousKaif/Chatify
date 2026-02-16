# MeetLy - Real-Time Video & Chat Platform

![MeetLy Banner](/frontend/public/logo.png)

**MeetLy** (formerly Chatify) is a sophisticated real-time communication platform designed to provide a seamless and immersive chat and video calling experience. Built with the MERN stack and powered by modern real-time technologies, MeetLy bridges the gap between simple messaging and professional video conferencing.

---

## 🚀 Key Features

### 💬 Real-Time Messaging
*   **Instant Delivery**: Powered by **Socket.IO** for sub-millisecond latency.
*   **Rich Media**: Share images directly within the chat.
*   **Message Status**: Real-time "Sent" and "Seen" indicators.
*   **Optimistic UI**: Instant feedback for a smoother user experience.

### 📹 HD Video Calling
*   **Crystal Clear Video**: Integrated with **Stream Video SDK** for high-definition calls.
*   **Global Layouts**: Custom **Paginated Grid Layout** handles multiple participants gracefully without clutter.
*   **Seamless Navigation**: Automatic redirection to chat upon call termination.
*   **Call Controls**: Full control over camera, microphone, and participant views.

### 🔐 Security & privacy
*   **Secure Auth**: **JWT-based authentication** with HTTP-only cookies.
*   **Rate Limiting**: Protected by **Arcjet** to prevent abuse and DDoS attacks.
*   **Data Protection**: Sensitive data handling best practices.

### 🎨 Modern UI/UX
*   **Responsive Design**: Fully responsive interface built with **Tailwind CSS**.
*   **Dark Mode**: Sleek, eye-friendly dark theme by default.
*   **Interactive Elements**: Smooth transitions, loading skeletons, and toast notifications.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **State Management**: Zustand
*   **Styling**: Tailwind CSS, DaisyUI
*   **Real-time**: Socket.IO Client
*   **Video SDK**: @stream-io/video-react-sdk
*   **Routing**: React Router v6

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Real-time**: Socket.IO
*   **Security**: Arcjet, JSON Web Tokens (JWT), bcryptjs
*   **Storage**: Cloudinary (for image uploads)
*   **Email**: Resend (for welcome emails/notifications)

### DevOps & Deployment
*   **Frontend Hosting**: Netlify/Vercel
*   **Backend Hosting**: Render
*   **Version Control**: Git & GitHub

---

## 📂 Project Structure

```bash
MeetLy/
├── backend/                # Node.js/Express Server
│   ├── src/
│   │   ├── config/         # DB, Cloudinary, Stream config
│   │   ├── controller/     # Request handlers
│   │   ├── lib/            # Utilities (Token gen, etc.)
│   │   ├── middleware/     # Auth, Error handling
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Routes
│   │   └── index.js        # Entry point
│   └── .env                # Backend secrets
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Axios setup
│   │   ├── pages/          # Page views (Home, Chat, Video)
│   │   ├── store/          # Zustand stores
│   │   └── App.jsx         # Main component
│   └── .env                # Frontend config
└── README.md               # This file
```

---

## ⚡ Getting Started

Follow these steps to set up MeetLy locally.

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Atlas Account
*   Cloudinary Account
*   GetStream.io Account (for Video)
*   Arcjet Account (Optional, for security)

### 1. Clone the Repository
```bash
git clone https://github.com/WhySeriousKaif/Chatify.git
cd Chatify
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following:
```env
PORT=10000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
ARCJET_KEY=your_arcjet_key
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/` with the following:
```env
VITE_API_URL=http://localhost:10000/api
VITE_STREAM_API_KEY=your_stream_key
```

Start the React app:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Authentication
*   `POST /api/auth/signup` - Register a new user
*   `POST /api/auth/login` - Login
*   `POST /api/auth/logout` - Logout
*   `GET /api/auth/check` - Verify session

### Messages
*   `GET /api/messages/users` - Get sidebar users
*   `GET /api/messages/:id` - Get chat history
*   `POST /api/messages/send/:id` - Send a message (Text/Image)

### Video
*   `POST /api/video/token` - Generate Stream Video token

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📧 Contact

**MD Kaif Molla** - [kaif00786001@gmail.com](mailto:kaif00786001@gmail.com)

Project Link: [https://github.com/WhySeriousKaif/Chatify](https://github.com/WhySeriousKaif/Chatify)
