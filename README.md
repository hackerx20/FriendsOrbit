# FriendsOrbit - Modern Social Media Platform

A full-stack social media application built with React, Node.js, PostgreSQL, and modern web technologies.

## ✨ Features

- **User Authentication** - Secure signup/login with JWT
- **Social Feed** - Create, like, comment on posts
- **Real-time Messaging** - Chat with other users instantly
- **AI Chat Assistant** - Powered by OpenAI GPT
- **User Profiles** - Customizable profiles with images
- **Follow System** - Follow/unfollow other users
- **Responsive Design** - Works on all devices
- **Modern UI** - Built with Tailwind CSS and DaisyUI

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **OpenAI API** - AI chat functionality

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd friendsorbit
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - Database credentials
   - JWT secret
   - Cloudinary credentials (for image uploads)
   - OpenAI API key (for AI chat)

4. **Set up the database**
   ```bash
   # Create database
   createdb friendsorbit
   
   # Run migrations
   npm run db:migrate
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from root directory)
   npm run dev
   
   # Start frontend (in another terminal)
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
friendsorbit/
├── backend/
│   ├── database/
│   │   ├── connection.js
│   │   ├── schema.sql
│   │   └── migrate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Message.js
│   │   └── AIChat.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   ├── messages.js
│   │   └── ai-chat.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── App.jsx
│   └── package.json
└── package.json
```

## 🔧 Configuration

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `posts` - User posts and content
- `messages` - Direct messages between users
- `ai_chat_sessions` - AI chat conversations
- `followers` - User follow relationships
- `likes` - Post likes
- `comments` - Post comments

### Environment Variables
See `.env.example` for all required environment variables.

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure reverse proxy (nginx recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- OpenAI for GPT API
- Cloudinary for image hosting
- All the amazing open-source libraries used in this project

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.