# Chatify Backend - API Documentation

A robust Node.js backend for the Chatify real-time chat application, built with Express.js, MongoDB, and Socket.IO.

## 🏗️ Architecture Overview

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── src/
│   ├── config/         # Configuration and setup
│   ├── controllers/    # Business logic
│   ├── middlewares/    # Custom middleware functions
│   ├── models/         # Database schemas
│   ├── routes/         # API route definitions
│   ├── emails/         # Email templates and handlers
│   └── index.js        # Server entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>=18.0.0)
- MongoDB Atlas account or local MongoDB
- Cloudinary account
- Resend account (optional)

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create a `.env` file in the backend directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatify
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend Email Service
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Chatify

# Arcjet Security
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 Database Models

### User Model (`models/user.model.js`)
```javascript
{
  fullName: String (required),
  email: String (required, unique),
  password: String (required),
  profilePic: String (default: ""),
  createdAt: Date,
  updatedAt: Date
}
```

**Features:**
- Unique email constraint
- Password hashing with bcrypt
- Profile picture support
- Automatic timestamps

### Message Model (`models/message.model.js`)
```javascript
{
  senderId: ObjectId (ref: User, required),
  receiverId: ObjectId (ref: User, required),
  text: String (maxlength: 2000),
  image: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

**Features:**
- References to User model
- Text message support (2000 char limit)
- Image sharing via Cloudinary
- Automatic timestamps

## 🔐 Authentication System

### JWT Token Generation (`config/utils.js`)
```javascript
const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d"
  });
  
  res.cookie("token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development"
  });
};
```

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- SameSite strict prevents CSRF attacks
- 15-day token expiration
- Secure flag for production

### Authentication Middleware (`middlewares/auth.middleware.js`)
```javascript
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
```

## 🌐 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/signup`
Register a new user.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "savedUser": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation:**
- All fields required
- Email format validation
- Password minimum 6 characters
- Unique email constraint

#### POST `/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "profilePic": ""
  }
}
```

#### POST `/logout`
Logout user and clear JWT token.

**Response:**
```json
{
  "message": "Logged Out successfully"
}
```

#### GET `/check`
Check if user is authenticated.

**Headers:** `Cookie: token=jwt_token`

**Response:**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": ""
}
```

#### POST `/update-profile`
Update user profile picture.

**Request Body:**
```json
{
  "profilePic": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "_id": "user_id",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/..."
}
```

### Message Routes (`/api/messages`)

#### GET `/contacts`
Get all users except the authenticated user.

**Headers:** `Cookie: token=jwt_token`

**Response:**
```json
[
  {
    "_id": "user_id",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "profilePic": "https://res.cloudinary.com/..."
  }
]
```

#### GET `/chats`
Get all users the authenticated user has chatted with.

**Headers:** `Cookie: token=jwt_token`

**Response:**
```json
[
  {
    "_id": "user_id",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "profilePic": "https://res.cloudinary.com/..."
  }
]
```

#### GET `/:userId`
Get all messages between authenticated user and specified user.

**Headers:** `Cookie: token=jwt_token`

**Response:**
```json
[
  {
    "_id": "message_id",
    "senderId": "sender_id",
    "receiverId": "receiver_id",
    "text": "Hello!",
    "image": "",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST `/send/:userId`
Send a message to a specific user.

**Headers:** `Cookie: token=jwt_token`

**Request Body:**
```json
{
  "text": "Hello!",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..." // optional
}
```

**Response:**
```json
{
  "_id": "message_id",
  "senderId": "sender_id",
  "receiverId": "receiver_id",
  "text": "Hello!",
  "image": "",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔌 Socket.IO Integration

### Socket Configuration (`config/socket.js`)
```javascript
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName}`);
    
    // Join user to their own room
    socket.join(socket.userId);
    
    // Emit online users to all clients
    const getOnlineUsers = () => {
      const onlineUsers = Array.from(io.sockets.sockets.values())
        .map(socket => ({
          _id: socket.userId,
          fullName: socket.user.fullName,
          profilePic: socket.user.profilePic
        }));
      io.emit("getOnlineUsers", onlineUsers);
    };
    
    getOnlineUsers();
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.fullName}`);
      getOnlineUsers();
    });
  });

  return io;
};
```

### Socket Events

#### Client to Server
- `connection` - User connects
- `disconnect` - User disconnects

#### Server to Client
- `getOnlineUsers` - List of online users
- `newMessage` - New message received

### Socket Authentication Middleware
```javascript
const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return next(new Error("User not found"));
    }
    
    socket.userId = user._id;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};
```

## 📧 Email Integration

### Email Handler (`emails/emailHandler.js`)
```javascript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const senderWelcomeEmail = async (email, fullName, clientURL) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: "Welcome to Chatify!",
      html: emailTemplate(fullName, clientURL),
    });

    if (error) {
      console.log("Error sending email:", error);
      return;
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.log("Error in senderWelcomeEmail:", error);
  }
};
```

### Email Template (`emails/emailTemplate.js`)
```javascript
export const emailTemplate = (fullName, clientURL) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Welcome to Chatify, ${fullName}!</h1>
      <p>Thank you for joining our real-time chat application.</p>
      <a href="${clientURL}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Start Chatting
      </a>
    </div>
  `;
};
```

## 🖼️ Image Upload with Cloudinary

### Cloudinary Configuration (`config/cloudinary.js`)
```javascript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

### Image Upload in Controllers
```javascript
// Upload profile picture
const uploadResponse = await cloudinary.uploader.upload(profilePic);

// Upload message image
const uploadResponse = await cloudinary.uploader.upload(image);
const imageUrl = uploadResponse.secure_url;
```

## 🔒 Security Features

### Rate Limiting with Arcjet
```javascript
import { arcjet, fixedWindow } from "@arcjet/node";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
});

const rateLimit = aj.protect(fixedWindow({
  max: 10,
  window: "1m",
}));
```

### CORS Configuration
```javascript
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
```

### Input Validation
- Email format validation
- Password length requirements
- Message length limits (2000 characters)
- File type validation for images

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLIENT_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_production_cloud_name
CLOUDINARY_API_KEY=your_production_api_key
CLOUDINARY_API_SECRET=your_production_api_secret
```

### Deployment Platforms
- **Heroku**: Easy deployment with buildpacks
- **Railway**: Modern deployment platform
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

### Production Checklist
- [ ] Set secure JWT secret
- [ ] Configure production MongoDB
- [ ] Set up Cloudinary production account
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

## 🧪 Testing

### Manual Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'

# Test message sending
curl -X POST http://localhost:3000/api/messages/send/user_id \
  -H "Content-Type: application/json" \
  -H "Cookie: token=your_jwt_token" \
  -d '{"text":"Hello World"}'
```

### API Testing Tools
- **Postman**: GUI for API testing
- **Insomnia**: Alternative to Postman
- **curl**: Command-line testing
- **Thunder Client**: VS Code extension

## 📝 Error Handling

### Standard Error Responses
```javascript
// 400 Bad Request
{ "message": "All fields are required" }

// 401 Unauthorized
{ "message": "No token, authorization denied" }

// 404 Not Found
{ "message": "User not found" }

// 500 Internal Server Error
{ "message": "Server error" }
```

### Error Logging
```javascript
console.error("Error during user registration:", error);
console.log("Error in login Controller:", err);
```

## 🔧 Development Tools

### Scripts
```json
{
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

### Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **socket.io**: Real-time communication
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cloudinary**: Image storage
- **resend**: Email service
- **arcjet**: Security and rate limiting
- **cors**: Cross-origin resource sharing
- **cookie-parser**: Cookie parsing
- **dotenv**: Environment variables

## 📊 Performance Considerations

### Database Optimization
- Index on email field for faster lookups
- Index on senderId and receiverId for message queries
- Connection pooling for MongoDB

### Socket.IO Optimization
- Room-based messaging for scalability
- Connection cleanup on disconnect
- Efficient online user tracking

### Memory Management
- Proper error handling to prevent memory leaks
- Connection cleanup in Socket.IO
- Efficient data structures for user tracking

---

**Backend Development Complete! 🚀**

For frontend documentation, see the `frontend/README.md` file.

