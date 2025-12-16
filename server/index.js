require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const Room = require('./models/Room');
const User = require('./models/User');
const Y = require('yjs');
const { LeveldbPersistence } = require('y-leveldb');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://hexode.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, log warning but maybe allow for now to prevent breakage if user changes domain
      console.log(`[CORS] Request from unknown origin: ${origin}`);
      // Default to allowing for this demo/beta phase, or restrict:
      // callback(new Error('Not allowed by CORS')); 
      callback(null, true); // Permissive fallback for smoother UX
    }
  },
  credentials: true
}));
app.use(express.json());

// --- Room Persistence API ---
app.post('/api/users/sync', async (req, res) => {
    try {
        const { clerkId, email, name } = req.body;
        let user = await User.findOne({ clerkId });
        if (!user) {
            user = new User({ clerkId, email, name });
            await user.save();
            console.log(`[DB] User created: ${email}`);
        } else {
            // Update name/email if changed
            if (user.name !== name || user.email !== email) {
                user.name = name;
                user.email = email;
                await user.save();
                console.log(`[DB] User updated: ${email}`);
            }
        }
        res.json(user);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/rooms', async (req, res) => {
    try {
        const { roomId, ownerId, files, name, lang } = req.body;
        let room = await Room.findOne({ roomId });
        if (!room) {
            room = new Room({ roomId, ownerId, files, name, lang });
            await room.save();
            console.log(`[DB] Room created: ${roomId} (${name})`);
        } else {
            // Update existing room
            if (files) room.files = files;
            if (name) room.name = name;
            if (lang) room.lang = lang;
            room.lastModified = Date.now();
            await room.save();
            // console.log(`[DB] Room updated: ${roomId}`);
        }
        res.json(room);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms', async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) return res.status(400).json({ error: 'Missing ownerId' });
        const rooms = await Room.find({ ownerId });
        res.json(rooms);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/rooms/:roomId', async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json(room);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Piston Execution API ---
app.post('/execute', async (req, res) => {
    const { code, files, language, stdin } = req.body;
  
  // LOGGING INPUT
  console.log("------------------------------------------------");
  console.log(`[EXECUTE] Language: ${language}`);
  console.log(`[EXECUTE] Stdin: "${stdin}"`);
  console.log(`[EXECUTE] Files: ${files ? files.length : 1} file(s)`);
  console.log("------------------------------------------------");

  try {
    const RUNTIMES = {
        javascript: '18.15.0', python: '3.10.0', java: '15.0.2', c: '10.2.0', cpp: '10.2.0',
    };
    const version = RUNTIMES[language] || '18.15.0';
    const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
    
    // Prepare files for Piston (support multi-file or legacy single-code)
    let pistonFiles = [];
    if (files && Array.isArray(files) && files.length > 0) {
        pistonFiles = files.map(f => ({ 
            name: f.name, 
            content: f.content 
        }));
    } else {
        pistonFiles = [{ content: code }];
    }

    const response = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: language || 'javascript',
            version: version,
            files: pistonFiles,
            stdin: stdin || ""
        })
    });
    const data = await response.json();
    
    // LOGGING OUTPUT
    console.log("[EXECUTE] Result:", JSON.stringify(data));
    
    res.json(data);
  } catch (error) {
    console.error("Execution Code Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
    res.send('DevDock API & Sync Server Running');
});

// --- Yjs / Helper Logic ---
const persistence = new LeveldbPersistence('./storage');
const docs = new Map(); // docName -> { doc, conns, awareness }

const messageSync = 0;
const messageAwareness = 1;

const updateHandler = async (update, origin, doc) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    
    docs.forEach((val) => {
        if (val.doc === doc) {
            val.conns.forEach((conn) => {
                if (conn !== origin && conn.readyState === WebSocket.OPEN) {
                    conn.send(message);
                }
            })
        }
    })
};

const setupWSConnection = (conn, req, docName) => {
    conn.binaryType = 'arraybuffer';
    if (!docs.has(docName)) {
        const doc = new Y.Doc();
        doc.gc = true;
        persistence.getYDoc(docName).then(persistedDoc => {
             const update = Y.encodeStateAsUpdate(persistedDoc);
             Y.applyUpdate(doc, update);
        });
        
        // Autosave hook: Also update MongoDB on changes?
        // Might be too heavy on every update. Better to have periodic sync from client or debounced here.
        // For now relying on Y-LevelDB for local, and API /api/rooms for explicit save.
        
        doc.on('update', update => persistence.storeUpdate(docName, update));
        
        const awareness = new awarenessProtocol.Awareness(doc);
        awareness.on('update', ({ added, updated, removed }, origin) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
            const buff = encoding.toUint8Array(encoder);
            docs.get(docName).conns.forEach((c) => { if (c.readyState === WebSocket.OPEN) c.send(buff); });
        });

        doc.on('update', (update, origin) => updateHandler(update, origin, doc));
        docs.set(docName, { doc, conns: new Set(), awareness });
    }

    const { doc, conns, awareness } = docs.get(docName);
    conns.add(conn);

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    conn.send(encoding.toUint8Array(encoder));

    if (awareness.getStates().size > 0) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
        conn.send(encoding.toUint8Array(encoder));
    }

    conn.on('message', (message) => {
        try {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(new Uint8Array(message));
            const messageType = decoding.readVarUint(decoder);
            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync);
                    syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
                    if (encoding.length(encoder) > 1) conn.send(encoding.toUint8Array(encoder));
                    break;
                case messageAwareness:
                    awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
                    break;
            }
        } catch (err) { console.error("Error handling message", err); }
    });

    conn.on('close', () => {
        conns.delete(conn);
        awarenessProtocol.removeAwarenessStates(awareness, [doc.clientID], null);
    });
};

// --- Server Startup ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
    const docName = req.url.slice(1) || 'default';
    setupWSConnection(conn, req, docName);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Hexode Server (API + Sync) running on port ${PORT}`);
});
