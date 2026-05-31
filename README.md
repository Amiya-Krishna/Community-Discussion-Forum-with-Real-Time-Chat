# Community Discussion Forum with Real-Time Chat

[![Node.js](https://img.shields.io/badge/Node.js-v18+-43853d?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-13aa52?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4+-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

---

## 📋 Project Overview

**Community Discussion Forum with Real-Time Chat** is a full-stack web application that enables users to create, discuss, and collaborate in real-time. Built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO, it combines asynchronous discussion forums with synchronous real-time messaging, creating a seamless community engagement platform.

This is a production-ready application demonstrating modern full-stack architecture, real-time communication patterns, and scalable system design—ideal for technical interviews at top-tier companies.

---

## 🎯 Problem Statement

Communities need platforms that support both:
1. **Asynchronous Discussions** – Threaded conversations that develop over time
2. **Synchronous Communication** – Immediate, real-time chat for quick collaboration

Existing solutions force users to choose between these paradigms. This project solves this by integrating both, allowing users to:
- Create persistent discussion threads with comments and notifications
- Engage in real-time conversations with live messaging
- Receive notifications for replies, mentions, and new messages
- Manage their profile and customize their experience

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **User Authentication** | Secure JWT-based authentication with password hashing (bcrypt) |
| 💬 **Real-Time Chat** | Socket.IO-powered instant messaging with presence detection |
| 📝 **Discussion Forum** | Create posts, add comments, nested thread support |
| 🔔 **Smart Notifications** | Real-time alerts for comments, replies, mentions, and new messages |
| 👤 **User Profiles** | Customizable profiles with avatar, bio, and activity tracking |
| 🔍 **Advanced Search** | Search posts by title, content, author, and tags |
| 🌓 **Dark/Light Theme** | System-wide theme switching with persistent user preferences |
| 📱 **Responsive Design** | Mobile-first design with Tailwind CSS for all devices |
| ⚡ **Real-Time Presence** | See who's online, typing indicators, and activity status |

---

## 🛠 Tech Stack

### **Frontend**
- **Framework:** React 18+ (Functional Components, Hooks)
- **Styling:** Tailwind CSS + PostCSS
- **Build Tool:** Vite (Ultra-fast development server)
- **Real-Time:** Socket.IO Client Library
- **State Management:** React Context API
- **Linting:** ESLint (Code quality)

### **Backend**
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (REST API)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcryptjs

### **Database**
- **Primary:** MongoDB (NoSQL, flexible schema)
- **ODM:** Mongoose (Schema validation, hooks)

### **Real-Time Communication**
- **Protocol:** Socket.IO v4+
- **Transport:** WebSocket with fallback to HTTP long-polling

### **Developer Tools**
- **Version Control:** Git
- **Package Manager:** npm
- **Environment:** .env variables for configuration

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  UI Components (Navbar, Sidebar, ChatBox, PostCard, etc.)   │   │
│  │  Context API (Auth, Theme)                                   │   │
│  │  Socket.IO Client (Real-Time Events)                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────▼──────────────────────────────────────────────┐
│                    SERVER (Express + Node.js)                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Routes        │ Auth, Posts, Notifications, Users          │   │
│  │  Controllers   │ Business Logic for each domain             │   │
│  │  Middleware    │ JWT Auth, Error Handling, Validation       │   │
│  │  Models        │ User, Post, Notification (Mongoose)        │   │
│  │  Socket.IO     │ Real-time Chat Events & Message Handling   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────────┘
                       │ MongoDB Driver
┌──────────────────────▼──────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                           │
│  Collections: Users │ Posts │ Notifications │ Comments             │
└──────────────────────────────────────────────────────────────────────┘
```

### **Data Flow**
1. **User Action** → React Component dispatches action
2. **API Request** → REST call or Socket event to Express server
3. **Validation** → Middleware authenticates and validates request
4. **Processing** → Controller executes business logic
5. **Database** → Model performs CRUD operations
6. **Response** → JSON response or Socket.IO broadcast to clients

---

## 📁 Folder Structure

```
Community Discussion Forum with Real-Time Chat/
│
├── client/                          # Frontend Application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── assets/                  # Images, icons, static files
│   │   ├── components/              # Reusable UI Components
│   │   │   ├── ChatBox.jsx
│   │   │   ├── CommentBox.jsx
│   │   │   ├── CreatePost.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── context/                 # State Management (Context API)
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx     # Theme preferences
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx       # Main layout wrapper
│   │   ├── pages/                   # Page Components (Routes)
│   │   │   ├── ChatPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Discussion.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── theme.js             # Theme configuration
│   │   ├── App.jsx                  # Main App component
│   │   ├── main.jsx                 # React entry point
│   │   ├── socket.js                # Socket.IO client setup
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── eslint.config.js
│   └── index.html
│
├── server/                          # Backend Application
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/                 # Business Logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── postController.js        # Post CRUD operations
│   │   └── notificationController.js # Notification handling
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verification, auth checks
│   ├── models/                      # Mongoose Schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Notification.js
│   ├── routes/                      # API Routes
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── notificationRoutes.js
│   ├── socket/
│   │   └── chatSocket.js            # Socket.IO event handlers
│   ├── package.json
│   └── server.js                    # Express app entry point
│
└── README.md                        # This file
```

---

## 🚀 Installation & Setup Instructions

### **Prerequisites**
- Node.js v18+ ([Download](https://nodejs.org/))
- npm v9+ (comes with Node.js)
- MongoDB Atlas account ([Create Free](https://www.mongodb.com/cloud/atlas))
- Git installed on your machine

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/yourusername/community-forum-chat.git
cd community-forum-chat
```

### **Step 2: Backend Setup**

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `server/` directory (see [Environment Variables](#-environment-variables) section):
```bash
touch .env
```

Start the backend server:
```bash
npm start
```

Expected output:
```
Server running on http://localhost:5000
Connected to MongoDB
```

### **Step 3: Frontend Setup**

Open a new terminal and navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `client/` directory:
```bash
touch .env.local
```

Add environment variables (see [Environment Variables](#-environment-variables) section):
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the development server:
```bash
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### **Step 4: Access the Application**

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔐 Environment Variables

### **Server (.env)**

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/forum_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Socket.IO Configuration
SOCKET_PORT=5000
```

### **Client (.env.local)**

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=Community Forum
```

**⚠️ Important:** Never commit `.env` files to version control. Use `.env.example` templates for documentation.

---

## 📡 API Endpoints

### **Authentication Routes** (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email & password | ❌ |
| GET | `/profile` | Get current user profile | ✅ |
| PUT | `/profile` | Update user profile | ✅ |
| POST | `/logout` | Logout user | ✅ |

### **Post Routes** (`/api/posts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get all posts (paginated, searchable) | ❌ |
| GET | `/:id` | Get single post with comments | ❌ |
| POST | `/` | Create new post | ✅ |
| PUT | `/:id` | Update post (owner only) | ✅ |
| DELETE | `/:id` | Delete post (owner only) | ✅ |
| POST | `/:id/comment` | Add comment to post | ✅ |
| DELETE | `/:postId/comment/:commentId` | Delete comment | ✅ |
| POST | `/:id/like` | Like/Unlike a post | ✅ |

### **Notification Routes** (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get user notifications (paginated) | ✅ |
| GET | `/unread` | Get unread notification count | ✅ |
| PUT | `/:id/read` | Mark notification as read | ✅ |
| DELETE | `/:id` | Delete notification | ✅ |

### **Example Request/Response**

**Create Post:**
```bash
POST /api/posts
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "title": "How to learn MERN Stack?",
  "description": "I'm new to full-stack development...",
  "tags": ["MERN", "JavaScript", "Learning"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "How to learn MERN Stack?",
    "description": "I'm new to full-stack development...",
    "author": {
      "_id": "507f1f77bcf86cd799439010",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tags": ["MERN", "JavaScript", "Learning"],
    "comments": [],
    "likes": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🔌 Socket.IO Events

Real-time communication is handled through Socket.IO events. Below are the key events:

### **Chat Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|---|
| `connect` | Server → Client | `{ socketId: string }` | User connects to socket |
| `joinRoom` | Client → Server | `{ roomId: string, userId: string }` | User joins a chat room |
| `leaveRoom` | Client → Server | `{ roomId: string, userId: string }` | User leaves a chat room |
| `sendMessage` | Client → Server | `{ roomId: string, message: string, sender: string }` | User sends message |
| `receiveMessage` | Server → Client | `{ sender: string, message: string, timestamp: Date }` | Broadcast incoming message |
| `userTyping` | Client → Server | `{ roomId: string, userId: string }` | User is typing |
| `userTypingUpdate` | Server → Client | `{ userId: string, name: string }` | Notify others about typing |
| `userOnline` | Server → Client | `{ userId: string, name: string }` | User came online |
| `userOffline` | Server → Client | `{ userId: string }` | User went offline |

### **Notification Events**

| Event | Direction | Payload | Description |
|-------|-----------|---------|---|
| `newNotification` | Server → Client | `{ type: string, message: string, from: string, postId?: string }` | Real-time notification |
| `notificationRead` | Client → Server | `{ notificationId: string }` | Mark as read |
| `clearNotifications` | Client → Server | `{}` | Clear all notifications |

### **Example Socket.IO Integration**

**Client (React):**
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

function ChatBox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receiveMessage', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off('receiveMessage');
  }, []);

  const handleSendMessage = (message) => {
    // Emit message to server
    socket.emit('sendMessage', {
      roomId: 'room123',
      message: message,
      sender: userId
    });
  };

  return (
    <div>
      {/* Messages display */}
      {messages.map((msg, idx) => (
        <p key={idx}>{msg.sender}: {msg.message}</p>
      ))}
      {/* Input field */}
    </div>
  );
}
```

**Server (Node.js):**
```javascript
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    io.to(roomId).emit('userOnline', { userId, name: 'User Name' });
  });

  socket.on('sendMessage', ({ roomId, message, sender }) => {
    io.to(roomId).emit('receiveMessage', {
      sender,
      message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
```

---

## 📸 Screenshots

### 🟢 Register

![Register](docs/screenshots/register.png)

### 🟢 Login

![Login](docs/screenshots/login.png)

### 🟢 Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### 🟢 Profile

![Profile](docs/screenshots/profile.png)


### 🟢 Create-discussion

![Create-discussion](docs/screenshots/create-discussion.png)

### 🟢 Comments

![Comments](docs/screenshots/comments.png)

### 🟢 Mongodb-data

![Mongodb-data](docs/screenshots/mongodb-data.png)

## 🔄 Usage Flow (User Journey)

### **1. User Registration & Login**
```
1. User opens application → Redirected to Login page
2. User clicks "Register" → Fills form (name, email, password)
3. Password hashed with bcrypt → User stored in MongoDB
4. User logs in → JWT token generated
5. Token stored in localStorage → User redirected to Dashboard
```

### **2. Viewing & Searching Posts**
```
1. User navigates to Dashboard
2. Posts fetched from /api/posts (paginated)
3. User can filter by tags, search by keyword
4. Click post → Navigates to Discussion page
5. Loads post details + comments via /api/posts/:id
```

### **3. Creating a New Post**
```
1. User clicks "Create Post" button
2. Opens modal/new page with form (title, description, tags)
3. Submits POST /api/posts with JWT auth
4. Post created in MongoDB
5. User redirected to post page
6. Real-time notification sent to followers
```

### **4. Commenting & Discussion**
```
1. User on Discussion page sees post + existing comments
2. User writes comment → POST /api/posts/:id/comment
3. Comment saved to database
4. Comment appears in real-time via Socket.IO
5. Author gets notification: "New comment on your post"
```

### **5. Real-Time Chat**
```
1. User navigates to Chat page
2. Socket.IO connects → joinRoom event emitted
3. User sees list of active users (online presence)
4. User selects chat → emits sendMessage event
5. Message appears in real-time for all room participants
6. Typing indicator shows when others type
```

### **6. Notifications**
```
1. User has unread badge on notification icon
2. Clicks notification → Shows notification panel (real-time update)
3. Notifications include:
   - New comments on user's posts
   - Mentions in comments
   - New messages in chat
   - User interactions (likes)
4. Click notification → Navigates to source (post or chat)
```

---

## 🚀 Future Improvements & Scalability

### **Phase 2: Performance & Caching**
- [ ] Implement **Redis** for caching frequently accessed data (posts, users)
- [ ] Session management with Redis
- [ ] Message queue (Bull or RabbitMQ) for async tasks

### **Phase 3: Advanced Features**
- [ ] **Mentions & Tagging System** – @ mentions in posts and comments
- [ ] **Private Messaging** – Direct DM between users
- [ ] **User Roles & Permissions** – Admin, Moderator, User roles
- [ ] **Post Categories/Channels** – Organize forums by topics
- [ ] **Trending/Recommended** – Algorithm-based post recommendations
- [ ] **Email Notifications** – Send email digests for important updates

### **Phase 4: Microservices Architecture**
- [ ] Split into microservices:
  - **Auth Service** – User authentication & JWT
  - **Post Service** – Post, comment, and discussion CRUD
  - **Chat Service** – Real-time messaging
  - **Notification Service** – Notification management
  - **Search Service** – Elasticsearch for advanced search
- [ ] API Gateway for routing
- [ ] Service-to-service communication via gRPC or message brokers

### **Phase 5: DevOps & Deployment**
- [ ] **Containerization:** Docker for frontend, backend, database
- [ ] **Orchestration:** Kubernetes for container management
- [ ] **CI/CD Pipeline:** GitHub Actions for automated testing and deployment
- [ ] **Monitoring:** ELK Stack (Elasticsearch, Logstash, Kibana) for logging
- [ ] **Cloud Deployment:** AWS, GCP, or Azure
- [ ] **Load Balancing:** NGINX for distributing traffic

### **Phase 6: Database Optimization**
- [ ] Add database indexing on frequently queried fields
- [ ] Implement pagination for large datasets
- [ ] Archive old posts/messages
- [ ] Database sharding for horizontal scaling

### **Phase 7: Security Enhancements**
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting on API endpoints
- [ ] CORS configuration tightening
- [ ] SQL injection & XSS protection
- [ ] Security headers (Helmet.js)
- [ ] Content moderation & spam detection

---

## 📚 Learning Outcomes

This project demonstrates expertise in several areas valued by FAANG companies:

### **Full-Stack Development**
- ✅ Building complete applications from frontend to backend
- ✅ Understanding client-server communication
- ✅ RESTful API design and best practices
- ✅ Database schema design and optimization

### **Real-Time Communication**
- ✅ WebSocket implementation with Socket.IO
- ✅ Event-driven architecture
- ✅ Broadcasting and room management
- ✅ Handling concurrent connections at scale

### **Frontend (React)**
- ✅ Functional components and React Hooks
- ✅ Context API for state management
- ✅ Component composition and reusability
- ✅ Responsive UI with Tailwind CSS
- ✅ Form handling and validation

### **Backend (Node.js/Express)**
- ✅ RESTful API development
- ✅ Middleware architecture and request handling
- ✅ Error handling and logging
- ✅ Input validation and sanitization

### **Database (MongoDB)**
- ✅ NoSQL database design
- ✅ Schema modeling with Mongoose
- ✅ CRUD operations
- ✅ Indexing and query optimization

### **Authentication & Security**
- ✅ JWT-based authentication flow
- ✅ Password hashing with bcrypt
- ✅ Protected routes and middleware
- ✅ Authorization patterns

### **DevOps & Deployment**
- ✅ Environment configuration (.env files)
- ✅ Development workflow and best practices
- ✅ Dependency management
- ✅ Version control with Git

### **System Design & Scalability**
- ✅ Recognizing bottlenecks and optimization opportunities
- ✅ Planning for horizontal and vertical scaling
- ✅ Caching strategies (Redis)
- ✅ Microservices architecture considerations

---

## 👨‍💼 Author

**Amiya Krishna Chaurasiya**  

B.Tech CSE Student

Aspiring Data Scientist and AI/ML Engineer

- 🔗 [GitHub](https://github.com/Amiya-Krishna)
- 💼 [LinkedIn](https://www.linkedin.com/in/amiya-krishna)
- 🌐 [Portfolio](https://yourportfolio.com)
- ✉️ [Email](amiyakrishna04@gmail.com)

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

### MIT License Summary
You are free to:
- ✅ Use this project for personal and commercial purposes
- ✅ Modify and distribute the code
- ✅ Include the code in proprietary applications

**With the condition that you include the license and copyright notice.**

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

---

## 📞 Support & Contribution

### **Having Issues?**
1. Check [GitHub Issues](https://github.com/yourusername/community-forum-chat/issues)
2. Review the FAQ section (add this if applicable)
3. Open a new issue with detailed description and steps to reproduce

### **Want to Contribute?**
We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

<div align="center">

**Made with ❤️ by [Amiya Krishna Chaurasiya]**

[⬆ Back to top](#community-discussion-forum-with-real-time-chat)

</div>
