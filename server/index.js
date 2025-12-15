const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const { LeveldbPersistence } = require('y-leveldb');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

const app = express();
app.use(cors());
app.use(express.json());

// --- Piston Execution API ---
app.post('/execute', async (req, res) => {
  const { code, language, stdin } = req.body;
  
  // LOGGING INPUT
  console.log("------------------------------------------------");
  console.log(`[EXECUTE] Language: ${language}`);
  console.log(`[EXECUTE] Stdin: "${stdin}"`);
  console.log("------------------------------------------------");

  try {
    const RUNTIMES = {
        javascript: '18.15.0', python: '3.10.0', java: '15.0.2', c: '10.2.0', cpp: '10.2.0',
    };
    const version = RUNTIMES[language] || '18.15.0';
    const PISTON_URL = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston/execute';
    
    const response = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: language || 'javascript',
            version: version,
            files: [{ content: code }],
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

const updateHandler = (update, origin, doc) => {
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
        // if (conns.size === 0) docs.delete(docName); // Optional cleanup
    });
};

// --- Server Startup ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
    // Extract room name from URL path (e.g. ws://host/room-name)
    const docName = req.url.slice(1) || 'default';
    setupWSConnection(conn, req, docName);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 DevDock Server (API + Sync) running on port ${PORT}`);
});
