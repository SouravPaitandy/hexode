const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');
const { LeveldbPersistence } = require('y-leveldb');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');
const mutex = require('lib0/mutex');

const port = 1234;
const persistence = new LeveldbPersistence('./storage');

// docName -> { doc: Y.Doc, conns: Set<WebSocket>, awareness: Awareness }
const docs = new Map();

const messageSync = 0;
const messageAwareness = 1;

const updateHandler = (update, origin, doc) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);
    
    // Broadcast to all valid connections for this doc
    // (We need to find the docName to get conns, or store conns on doc)
    // Actually, we can just look it up.
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
    
    // 1. Get or Create Doc
    if (!docs.has(docName)) {
        const doc = new Y.Doc();
        doc.gc = true;
        
        // Bind Persistence
        // 1. Load data from disk
        persistence.getYDoc(docName).then(persistedDoc => {
             const update = Y.encodeStateAsUpdate(persistedDoc);
             Y.applyUpdate(doc, update);
        });

        // 2. Save updates to disk
        doc.on('update', update => {
             persistence.storeUpdate(docName, update);
        });
        
        // Setup Awareness
        const awareness = new awarenessProtocol.Awareness(doc);
        awareness.on('update', ({ added, updated, removed }, origin) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageAwareness);
            encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
            const buff = encoding.toUint8Array(encoder);
            
            docs.get(docName).conns.forEach((c) => {
                if (c.readyState === WebSocket.OPEN) {
                    c.send(buff);
                }
            });
        });

        // Setup Update Handler
        doc.on('update', (update, origin) => updateHandler(update, origin, doc));

        docs.set(docName, { doc, conns: new Set(), awareness });
    }

    const { doc, conns, awareness } = docs.get(docName);
    conns.add(conn);

    // 2. Initial Sync Step 1 (Send Server State Vector)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    conn.send(encoding.toUint8Array(encoder));

    // 3. Send Awareness State
    if (awareness.getStates().size > 0) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
        conn.send(encoding.toUint8Array(encoder));
    }

    // 4. Handle Incoming Messages
    conn.on('message', (message) => {
        try {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(new Uint8Array(message));
            const messageType = decoding.readVarUint(decoder);
            
            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync);
                    syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
                    if (encoding.length(encoder) > 1) {
                         conn.send(encoding.toUint8Array(encoder));
                    }
                    break;
                case messageAwareness:
                    awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), conn);
                    break;
            }
        } catch (err) {
            console.error("Error handling message", err);
        }
    });
    
    // 5. Cleanup
    conn.on('close', () => {
        conns.delete(conn);
        awarenessProtocol.removeAwarenessStates(awareness, [doc.clientID], null); // This might be wrong, awareness handles it?
        // Actually clientID is usually from conn.
        // Awareness protocol removes states automatically if timeout?
        // No, we should manually remove if we track clientIDs.
        // But for now, let's trust awareness timeout (default 30s).
        
        if (conns.size === 0) {
            // persistence.writeState(docName, doc) // handled by bindState
            // docs.delete(docName); // Keep in memory for speed? Or delete to save RAM.
            // Let's keep it for now.
        }
    });
};

const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('DevDock Sync Server Running');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
    // docName from url path
    const docName = req.url.slice(1) || 'default';
    setupWSConnection(conn, req, docName);
});

server.listen(port, () => {
    console.log(`Sync Server (Custom Persistence) running on port ${port}`);
});
