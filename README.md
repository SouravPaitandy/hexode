# DevDock 🚢
**The Collaborative Cloud IDE.** Code together, anywhere, anytime.

![DevDock](https://img.shields.io/badge/Status-Public_Beta-blue?style=for-the-badge) 
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

DevDock is a **fully functional, browser-based Integrated Development Environment (IDE)** built for real-time collaboration. It allows multiple users to edit code simultaneously, chat, manage projects, and execute code in secure sandboxed environments—just like VS Code Live Share, but entirely in the browser.

---

## ✨ Features

*   **Real-Time Collaboration**: Powered by **Y.js** and WebSockets. See other users' cursors and edits instantly (sub-millisecond latency).
*   **Polyglot Execution Engine**: Run code securely in **Python, JavaScript, Java, and C++**.
*   **Persistent File System**: Create, rename, delete, and organize files. Projects are saved automatically.
*   **VS Code Experience**: Built with **Monaco Editor**, offering syntax highlighting, minimaps, and IntelliSense-like feel.
*   **Integrated Chat**: Communicate with your team directly within the IDE.
*   **Cloud Native**: Designed for serverless/containerized deployment (Docker, Render, Vercel).

---

## 🛠️ Tech Stack

*   **Frontend**: React, Vite, Framer Motion, Lucide React.
*   **Editor**: Monaco Editor (`@monaco-editor/react`).
*   **Collaboration**: Y.js, Y-Websocket, Y-Monaco.
*   **Backend**: Node.js, Express, WebSocket (`ws`).
*   **Persistence**: Y-LevelDB (Server), LocalStorage (Client).
*   **Execution**: Piston API (Sandboxed Code Runner).

---

## 🚀 Getting Started

You can run DevDock efficiently on your local machine, with or without Docker.

### Option 1: Manual Run (Recommended for Development)
No Docker required. Just Node.js.

**1. Start the Server**
```bash
cd server
npm install
npm run dev
```
*Runs on Port 3001 (API + WebSocket).*

**2. Start the Client**
```bash
cd client
npm install
npm run dev
```
*Opens in browser at `http://localhost:5173`.*

---

### Option 2: Docker Compose (Production Ready)
Ideally used for deployments or clean setups.

```bash
docker-compose up --build
```
*Apps run on `localhost:80` (Client) and `localhost:3001` (Server).*

---

## ☁️ Deployment

DevDock is architected to run on free cloud tiers.

*   **Frontend**: Deploy `client` folder to **Vercel** or **Netlify**.
    *   Env Var: `VITE_API_URL` = `https://your-backend.com`
    *   Env Var: `VITE_WS_URL` = `wss://your-backend.com`
*   **Backend**: Deploy `server` folder to **Render** or **Railway**.
    *   Docs: See `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

---

## 📸 Screenshots

*(Add screenshots of your Dashboard and IDE here)*

---

## 📜 License

MIT License. Free to use and modify.

---

Made with ❤️ by [Sourav Paitandy](https://www.souravpaitandy.me/)
