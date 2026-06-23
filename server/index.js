require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const User = require("./models/User");
const Y = require("yjs");
const { LeveldbPersistence } = require("y-leveldb");
const syncProtocol = require("y-protocols/sync");
const awarenessProtocol = require("y-protocols/awareness");
const encoding = require("lib0/encoding");
const decoding = require("lib0/decoding");

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const app = express();
const server = http.createServer(app);

// Initialize Socket.io (REMOVED: Terminal feature reverted per user request)

// Yjs documents storage (needed for AI context fetching)
const docs = new Map(); // docName -> { doc, conns, awareness }

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // Added fallback port
  "http://localhost:4173",
  "https://hexode.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        console.warn(
          `[CORS] Blocked request from unauthorized origin: ${origin}`
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// --- Rate Limiting ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit project/room creation to 5 per minute
  message: "Too many creation requests, please slow down.",
});

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);
app.use("/api/rooms", createLimiter);
app.use(
  "/execute",
  rateLimit({
    windowMs: 60 * 1000,
    max: 15, // 15 code executions per minute
    message: "Too many code executions, please wait.",
  })
);

// --- Room Persistence API ---
app.post("/api/users/sync", async (req, res) => {
  try {
    const { clerkId, email, name } = req.body;

    // Input validation
    if (!clerkId || typeof clerkId !== "string") {
      return res.status(400).json({ error: "Invalid clerkId" });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (!name || typeof name !== "string" || name.length > 100) {
      return res.status(400).json({ error: "Invalid name" });
    }

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const { roomId, ownerId, files, name, lang, isGuestEditAllowed } = req.body;

    // Input validation
    if (!roomId || typeof roomId !== "string" || roomId.length > 100) {
      return res.status(400).json({ error: "Invalid roomId" });
    }
    if (name && (typeof name !== "string" || name.length > 200)) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (files && typeof files !== "object") {
      return res.status(400).json({ error: "Invalid files format" });
    }

    let room = await Room.findOne({ roomId });
    if (!room) {
      room = new Room({
        roomId,
        ownerId,
        files,
        name,
        lang,
        isGuestEditAllowed,
      });
      await room.save();
      console.log(`[DB] Room created: ${roomId} (${name})`);
    } else {
      // Update existing room
      if (files) room.files = files;
      if (name) room.name = name;
      if (lang) room.lang = lang;
      if (typeof isGuestEditAllowed === "boolean")
        room.isGuestEditAllowed = isGuestEditAllowed;
      room.lastModified = Date.now();
      await room.save();
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rooms", async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ error: "Missing ownerId" });
    const rooms = await Room.find({ ownerId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rooms/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await Room.deleteOne({ roomId });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Room not found" });
    console.log(`[DB] Room deleted: ${roomId}`);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name, lang, isGuestEditAllowed } = req.body;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (name) room.name = name;
    if (lang) room.lang = lang;
    if (typeof isGuestEditAllowed === "boolean")
      room.isGuestEditAllowed = isGuestEditAllowed;
    room.lastModified = Date.now();
    await room.save();
    console.log(`[DB] Room renamed: ${roomId} -> ${name}`);
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI Chat Endpoint (Google Gemini) ---
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Per-minute rate limiter (5 RPM for gemini-3-flash)
const aiLimiterMinute = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: "Too many AI requests, please try again in a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-day rate limiter (20 RPD for gemini-3-flash)
const aiLimiterDay = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // 20 requests per day
  message:
    "Daily AI request limit reached (20/day). Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/ai/chat", aiLimiterMinute, aiLimiterDay, async (req, res) => {
  try {
    const { roomId, message, fileName, cursorLine } = req.body;

    // Validation
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }
    if (!roomId || typeof roomId !== "string") {
      return res.status(400).json({ error: "Invalid roomId" });
    }

    // Query Screening: Check if query is coding-related
    const nonCodingKeywords = [
      "weather",
      "news",
      "recipe",
      "movie",
      "song",
      "game",
      "sports",
      "politics",
      "celebrity",
      "joke",
      "story",
      "restaurant",
      "travel",
      "shopping",
      "dating",
      "tiktok",
      "instagram",
      "facebook",
    ];

    const lowerMessage = message.toLowerCase();

    // Strong coding indicators only
    const isCodingRelated =
      lowerMessage.includes("code") ||
      lowerMessage.includes("function") ||
      lowerMessage.includes("bug") ||
      lowerMessage.includes("error") ||
      lowerMessage.includes("debug") ||
      lowerMessage.includes("optimize") ||
      lowerMessage.includes("refactor") ||
      lowerMessage.includes("variable") ||
      lowerMessage.includes("class") ||
      lowerMessage.includes("method") ||
      lowerMessage.includes("api") ||
      lowerMessage.includes("syntax") ||
      lowerMessage.includes("algorithm") ||
      lowerMessage.includes("array") ||
      lowerMessage.includes("object") ||
      lowerMessage.includes("loop") ||
      lowerMessage.includes("react") ||
      lowerMessage.includes("javascript") ||
      lowerMessage.includes("python") ||
      lowerMessage.includes("java");

    const hasNonCodingKeywords = nonCodingKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    if (hasNonCodingKeywords && !isCodingRelated) {
      return res.status(400).json({
        error:
          "I'm HexodeAI, a coding assistant. Please ask coding-related questions only.",
      });
    }

    // Cached Responses for Common Queries
    const cachedResponses = {
      "who are you":
        "I'm **HexodeAI**, your AI coding assistant powered by Google Gemini. I can help you:\n\n- 🔍 Explain code\n- 🐛 Find and fix bugs\n- ⚡ Optimize performance\n- 📝 Generate code snippets\n- 🔄 Refactor code\n- 💡 Suggest best practices\n\nJust ask me anything about your code!",

      "what can you do":
        "I can help you with:\n\n- **Code Explanation**: Understand complex code\n- **Bug Detection**: Find potential issues\n- **Code Generation**: Create functions, classes, APIs\n- **Optimization**: Improve performance\n- **Refactoring**: Clean up code\n- **Best Practices**: Follow coding standards\n\nTry asking: *'Explain this code'* or *'Find bugs in this function'*",

      hello:
        "👋 Hello! I'm HexodeAI, your coding assistant. How can I help you with your code today?",

      hi: "👋 Hi there! Ready to help with your code. What would you like to work on?",

      help: "**Quick Commands:**\n\n- *Explain this code* - Get detailed explanations\n- *Find bugs* - Detect potential issues\n- *Optimize this* - Improve performance\n- *Add comments* - Document your code\n- *Refactor to...* - Restructure code\n\nYou can also ask specific questions about your code!",
    };

    // Check for cached response (exact word match only)
    for (const [key, response] of Object.entries(cachedResponses)) {
      // Use word boundaries to match exact phrases only
      const regex = new RegExp(`\\b${key}\\b`, "i");
      if (regex.test(lowerMessage) && lowerMessage.trim() === key) {
        // Send cached response immediately (no streaming)
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        res.write(`data: ${JSON.stringify({ text: response })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      }
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "AI service not configured. Please add GEMINI_API_KEY to server .env",
      });
    }

    // Fetch code context from Yjs (server-side)
    let codeContext = "";
    let language = "javascript";

    try {
      if (fileName && docs.has(roomId)) {
        const docData = docs.get(roomId);
        if (docData && docData.doc) {
          const ydoc = docData.doc;
          const yText = ydoc.getText(fileName);
          if (yText) {
            codeContext = yText.toString();

            // Detect language from file extension
            if (fileName.endsWith(".py")) language = "python";
            else if (fileName.endsWith(".java")) language = "java";
            else if (fileName.endsWith(".cpp") || fileName.endsWith(".c"))
              language = "c++ or c";

            // Limit context to 2000 characters to save tokens
            if (codeContext.length > 2000) {
              codeContext =
                codeContext.substring(0, 2000) + "\n... (truncated)";
            }
          }
        }
      }
    } catch (err) {
      console.warn("[AI] Could not fetch code context:", err.message);
      // Continue without context
    }

    // Construct prompt for Gemini
    const systemPrompt = `You are a helpful coding assistant integrated into Hexode IDE.
${fileName ? `User is working on: ${fileName}` : ""}
${language ? `Language: ${language}` : ""}
${
  codeContext
    ? `\nCurrent code:\n\`\`\`${language}\n${codeContext}\n\`\`\``
    : ""
}

User question: ${message}

Provide concise, actionable responses. Include code snippets when helpful. Format code with markdown code blocks.`;

    // Call Gemini API with streaming
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const result = await model.generateContentStream(systemPrompt);

    // Stream response chunks
    for await (const chunk of result.stream) {
      const text = chunk.text();
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[AI] Error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "AI request failed: " + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

// --- Code Execution API (Judge0 CE) ---
app.post("/execute", async (req, res) => {
  const { code, files, language, stdin } = req.body;

  console.log("------------------------------------------------");
  console.log(`[EXECUTE] Language: ${language}`);
  console.log(`[EXECUTE] Stdin: "${stdin}"`);
  console.log(`[EXECUTE] Files: ${files ? files.length : 1} file(s)`);
  console.log("------------------------------------------------");

  try {
    // -- Optional: Self-hosted Piston fallback (set PISTON_URL in .env) --
    if (process.env.PISTON_URL) {
      const RUNTIMES = {
        javascript: "18.15.0",
        python: "3.10.0",
        java: "15.0.2",
        c: "10.2.0",
        cpp: "10.2.0",
      };
      const version = RUNTIMES[language] || "18.15.0";
      let pistonFiles = [];
      if (files && Array.isArray(files) && files.length > 0) {
        pistonFiles = files.map((f) => ({ name: f.name, content: f.content }));
      } else {
        pistonFiles = [{ content: code }];
      }
      const pistonRes = await fetch(process.env.PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language || "javascript",
          version,
          files: pistonFiles,
          stdin: stdin || "",
        }),
      });
      const pistonData = await pistonRes.json();
      console.log("[EXECUTE] Piston Result:", JSON.stringify(pistonData));
      return res.json(pistonData);
    }

    // -- Judge0 CE (public free endpoint, no key required for moderate use) --
    // Full language list: https://ce.judge0.com/languages
    const JUDGE0_LANG_IDS = {
      javascript: 63, // Node.js 12.14.0
      python:     71, // Python 3.8.1
      java:       62, // Java OpenJDK 13.0.1
      c:          50, // C (GCC 9.2.0)
      cpp:        54, // C++ (GCC 9.2.0)
    };

    const languageId = JUDGE0_LANG_IDS[language] || JUDGE0_LANG_IDS.javascript;

    // Judge0 only accepts a single source_code string.
    // We must intelligently merge multi-file projects into one submission.

    // Extension whitelist per language — only merge same-language files
    const LANG_EXTENSIONS = {
      javascript: [".js", ".cjs", ".mjs"],
      python:     [".py"],
      java:       [".java"],
      c:          [".c", ".h"],
      cpp:        [".cpp", ".cc", ".cxx", ".hpp", ".h"],
    };
    const allowedExts = LANG_EXTENSIONS[language] || [];

    const allFiles = files && Array.isArray(files) && files.length > 0
      ? files
      : [{ name: "main", content: code || "" }];

    // The entry point is always files[0] (client sends active file first)
    const entryFile = allFiles[0];

    // Only include files whose extension matches the active language
    const otherFiles = allFiles
      .slice(1)
      .filter((f) => allowedExts.some((ext) => f.name.endsWith(ext)));

    let sourceCode = "";

    if (language === "java") {
      // Java: Judge0 names the file "Main.java" internally, so the public class
      // MUST be named "Main". We extract the actual public class name from the
      // source and rename it to Main, then inline all other files as inner classes.
      let entryContent = entryFile.content;

      // Find the public class name in the entry file
      const publicClassMatch = entryContent.match(/public\s+class\s+(\w+)/);
      const publicClassName = publicClassMatch ? publicClassMatch[1] : null;

      if (publicClassName && publicClassName !== "Main") {
        // Rename all occurrences of the public class to Main so Judge0 is happy
        entryContent = entryContent
          .replace(
            new RegExp(`public\\s+class\\s+${publicClassName}`, "g"),
            "public class Main"
          )
          .replace(
            new RegExp(`\\b${publicClassName}\\b`, "g"),
            "Main"
          );
      }

      // Inline other .java files: strip package decls, make package-private,
      // and rename any class named "Main" to avoid collision with the entry point.
      const otherClassCode = otherFiles
        .map((f) => {
          let content = f.content;

          // Remove package declarations (not supported in single-file Judge0 submission)
          content = content.replace(/^\s*package\s+[\w.]+\s*;/gm, "");

          // Make all top-level public classes package-private
          content = content.replace(/\bpublic\s+class\s+/g, "class ");

          // Derive a safe class alias from the filename (e.g. "Dev.java" → "Dev")
          let safeAlias = f.name
            .replace(/\.java$/, "")
            .replace(/[^a-zA-Z0-9_]/g, "_");

          // Edge case: if the other file is literally "Main.java", suffix it
          // so it never clashes with the entry point's class name
          if (safeAlias === "Main") safeAlias = "Main_Helper";

          // If this file declares a class called "Main" (now package-private),
          // rename it to the safe alias so it doesn't clash with the entry Main.
          if (/\bclass\s+Main\b/.test(content)) {
            content = content.replace(/\bclass\s+Main\b/g, `class ${safeAlias}`);
            // Also rename references to Main (usages) inside this file
            content = content.replace(
              new RegExp(`\\bMain\\b`, "g"),
              safeAlias
            );
          }

          return `\n// --- ${f.name} ---\n${content}`;
        })
        .join("\n");

      sourceCode = entryContent + otherClassCode;


    } else if (language === "javascript") {
      // JavaScript: build a require() shim so require('./filename') calls resolve
      // to the inlined content at runtime, without relying on a real filesystem.
      const moduleRegistry = {};
      otherFiles.forEach((f) => {
        // Strip file extension for the key, support relative paths like './utils'
        const key = f.name
          .replace(/^\.\//, "")        // remove leading ./
          .replace(/\.(js|cjs|mjs)$/, ""); // remove extension
        moduleRegistry[key] = f.content;
      });

      const shimCode = Object.keys(moduleRegistry).length > 0
        ? `
// ── Hexode multi-file require() shim ────────────────────────────────────
const __modules__ = {};
const __moduleCode__ = ${JSON.stringify(moduleRegistry)};
const __origRequire = require;
function require(id) {
  // Normalize: strip leading ./ and extension
  const key = id.replace(/^\\.?\\//, '').replace(/\\.(js|cjs|mjs)$/, '');
  if (__moduleCode__[key] !== undefined) {
    if (!__modules__[key]) {
      const module = { exports: {} };
      const fn = new Function('module', 'exports', 'require', __moduleCode__[key]);
      fn(module, module.exports, require);
      __modules__[key] = module.exports;
    }
    return __modules__[key];
  }
  return __origRequire(id);
}
// ─────────────────────────────────────────────────────────────────────────
`
        : "";

      sourceCode = shimCode + "\n" + entryFile.content;

    } else {
      // C, C++, Python: just concatenate all files.
      // For C/C++, shared header content lands before the entry point.
      // For Python, all helper functions/classes are available in scope.
      const prefix = otherFiles
        .map((f) => `// --- ${f.name} ---\n${f.content}`)
        .join("\n\n");

      sourceCode = prefix
        ? prefix + "\n\n// --- " + entryFile.name + " ---\n" + entryFile.content
        : entryFile.content;
    }

    // ?wait=true makes it synchronous — no separate polling step needed
    const JUDGE0_URL =
      process.env.JUDGE0_URL ||
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

    const judge0Res = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin || "",
      }),
    });


    if (!judge0Res.ok) {
      const errText = await judge0Res.text();
      console.error("[EXECUTE] Judge0 HTTP Error:", judge0Res.status, errText);
      return res.status(502).json({
        error: `Execution service returned ${judge0Res.status}. Try again shortly.`,
      });
    }

    const j = await judge0Res.json();
    console.log("[EXECUTE] Judge0 Result:", JSON.stringify(j));

    // Normalize to Piston-compatible shape so the client needs zero changes:
    // Piston shape: { run: { output, stdout, stderr, code, signal } }
    const stdout     = j.stdout        || "";
    const stderr     = j.stderr        || "";
    const compileErr = j.compile_output || "";
    const exitCode   = j.exit_code     ?? 0;

    // Combine outputs so users see compile errors + runtime output together
    const combinedOutput = [stdout, compileErr, stderr]
      .filter(Boolean)
      .join("\n")
      .trim();

    res.json({
      run: {
        output: combinedOutput,
        stdout,
        stderr: stderr || compileErr,
        code:   exitCode,
        signal: j.signal || null,
      },
    });
  } catch (error) {
    console.error("[EXECUTE] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("DevDock API & Sync Server Running");
});

// --- Yjs / Helper Logic ---
const persistence = new LeveldbPersistence("./storage");
// docs Map is defined at the top of the file

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
      });
    }
  });
};

const setupWSConnection = (conn, req, docName) => {
  conn.binaryType = "arraybuffer";
  if (!docs.has(docName)) {
    const doc = new Y.Doc();
    doc.gc = true;
    persistence.getYDoc(docName).then((persistedDoc) => {
      const update = Y.encodeStateAsUpdate(persistedDoc);
      Y.applyUpdate(doc, update);
    });

    doc.on("update", (update) => persistence.storeUpdate(docName, update));

    const awareness = new awarenessProtocol.Awareness(doc);
    awareness.on("update", ({ added, updated, removed }, origin) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      docs.get(docName).conns.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) c.send(buff);
      });
    });

    doc.on("update", (update, origin) => updateHandler(update, origin, doc));
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
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awareness.getStates().keys())
      )
    );
    conn.send(encoding.toUint8Array(encoder));
  }

  conn.on("message", (message) => {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);
      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
          if (encoding.length(encoder) > 1)
            conn.send(encoding.toUint8Array(encoder));
          break;
        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
      }
    } catch (err) {
      console.error("Error handling message", err);
    }
  });

  conn.on("close", () => {
    conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(awareness, [doc.clientID], null);
  });
};

// --- Server Startup ---
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (conn, req) => {
  const docName = req.url.slice(1) || "default";
  setupWSConnection(conn, req, docName);
});

server.on("upgrade", (request, socket, head) => {
  if (request.url.startsWith("/socket.io/")) {
    // Socket.io not installed anymore check.
    // If client tries to connect, we just ignore.
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Hexode Server (API + Sync) running on port ${PORT}`);
});
