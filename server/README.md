# Hexode Server

Node.js backend for Hexode collaborative IDE with real-time synchronization and code execution.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Server runs on: `http://localhost:3001`

## 📦 Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose** - Database
- **Yjs** + **y-leveldb** - CRDT persistence
- **WebSocket** - Real-time communication
- **Piston API** - Code execution
- **express-rate-limit** - DDoS protection

## 🔧 Environment Variables

Create `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/hexode
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PISTON_URL=https://emkc.org/api/v2/piston/execute  # Optional
```

## 📁 Project Structure

```
server/
├── models/             # MongoDB models
│   ├── Room.js        # Project/room model
│   └── User.js        # User model
├── storage/           # Yjs LevelDB storage (auto-generated)
└── index.js           # Main server file
```

## 🔌 API Endpoints

### Users

- `POST /api/users/sync` - Sync user from Clerk

### Projects (Rooms)

- `GET /api/rooms?ownerId=xxx` - Get user's projects
- `GET /api/rooms/:roomId` - Get project details
- `POST /api/rooms` - Create/update project
- `PUT /api/rooms/:roomId` - Update project name/lang
- `DELETE /api/rooms/:roomId` - Delete project

### Code Execution

- `POST /execute` - Execute code via Piston

### WebSocket

- `ws://localhost:3001/:roomId` - Yjs sync endpoint

## 🔒 Security Features

### CORS Protection

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "https://hexode.vercel.app",
  process.env.CLIENT_URL,
];
```

### Rate Limiting

- **API**: 100 requests per 15 minutes
- **Project Creation**: 5 per minute
- **Code Execution**: 15 per minute

### Input Validation

All endpoints validate:

- Required fields
- Data types
- String lengths
- Object formats

## 🗄️ Database Schema

### Room (Project)

```javascript
{
  roomId: String (unique),
  ownerId: String,
  name: String,
  lang: String,
  files: Object,
  createdAt: Date,
  lastModified: Date
}
```

### User

```javascript
{
  clerkId: String (unique),
  email: String,
  name: String,
  createdAt: Date
}
```

## 🔄 Real-Time Sync (Yjs)

### How It Works

1. Client connects via WebSocket
2. Yjs syncs document state
3. Changes persisted to LevelDB
4. Periodic MongoDB backup via API

### Storage Layers

- **LevelDB**: Fast local persistence
- **MongoDB**: Long-term cloud storage
- **Hybrid approach**: Best of both worlds

## 🏗️ Code Execution

### Supported Languages

- JavaScript (Node.js 18.15.0)
- Python (3.10.0)
- Java (15.0.2)
- C (GCC 10.2.0)
- C++ (G++ 10.2.0)

### Piston API

```javascript
POST https://emkc.org/api/v2/piston/execute
{
  "language": "javascript",
  "version": "18.15.0",
  "files": [{ "content": "console.log('Hello')" }],
  "stdin": ""
}
```

## 🧪 Development

```bash
# Run dev server with nodemon
npm run dev

# Run production
npm start
```

## 📊 Monitoring

### Logs

- User sync: `[DB] User created/updated`
- Room operations: `[DB] Room created/deleted/renamed`
- CORS blocks: `[CORS] Blocked request from...`

### Database

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/hexode

# View collections
show collections

# Query rooms
db.rooms.find()
```

## 🐛 Troubleshooting

### MongoDB Connection Failed

```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas (cloud)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hexode
```

### Port Already in Use

```bash
# Kill process on port 3001
npx kill-port 3001
```

### Yjs Storage Issues

```bash
# Clear LevelDB storage
rm -rf storage/
```

## 🔐 Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure CORS for production domain
4. Enable HTTPS
5. Set up process manager (PM2)

```bash
# PM2 example
pm2 start index.js --name hexode-server
pm2 save
pm2 startup
```

## 📝 Notes

- LevelDB storage grows over time (consider cleanup strategy)
- Rate limits can be adjusted in `index.js`
- Piston API is free but has rate limits
- Consider self-hosting Piston for production
