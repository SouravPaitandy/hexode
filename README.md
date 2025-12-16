# Hexode ⚡

**A Real-Time Collaborative Cloud IDE for Modern Coders**

Hexode is a **browser-based collaborative Integrated Development Environment (IDE)** that enables developers and students to **create projects, write code, execute programs, and collaborate in real time** — directly from the browser.

It combines the power of a modern code editor with instant collaboration and cloud execution, making it ideal for **learning, pair programming, interviews, hackathons, open-source contribution, and team development**.

> 🎯 **Goal:** Remove local setup friction and make collaborative coding as easy as sharing a link.

---

## ✨ Key Features

Hexode is designed to feel familiar like a local IDE, while unlocking the power of real-time cloud collaboration.

* **⚡ Real-Time Collaboration**
  Multi-user editing powered by **Y.js** and **WebSockets**. See teammates’ cursors, selections, and edits live with near real-time latency.

* **🧠 Polyglot Code Execution**
  Run code securely in **Python, JavaScript, Java, and C++** using sandboxed execution environments.

* **📁 Project-Based File System**
  Create, rename, delete, and organize files and folders. Projects persist automatically.

* **🧩 VS Code–Like Editor Experience**
  Built with **Monaco Editor** (the engine behind VS Code), featuring syntax highlighting, minimap, and smooth editing.

* **💬 Integrated Team Chat**
  Collaborate not just on code, but also through a built-in chat panel inside the IDE.

* **☁️ Cloud-Native Architecture**
  Designed to run seamlessly on modern platforms like **Vercel**, **Render**, and **Docker**.

---

## 🏗️ System Architecture (High-Level)

Hexode follows a **client–server real-time collaboration architecture** designed for low latency and scalability.

```
┌───────────────┐        WebSocket        ┌────────────────────┐
│   Browser     │  ◀──────────────────▶  │  Collaboration     │
│  (Monaco +    │                         │  Server (Node.js)  │
│   Y.js)       │                         │  + Y-WebSocket     │
└──────┬────────┘                         └─────────┬──────────┘
       │                                            │
       │ REST / WS                                  │ Persistence
       ▼                                            ▼
┌───────────────┐                        ┌────────────────────┐
│ Execution     │                        │   MongoDB Storage  │
│ Engine        │                        │                    │
│ (Piston API)  │                        └────────────────────┘
└───────────────┘
```

### Key Design Principles

* **Real-time first:** Shared document state powered by Y.js
* **Execution isolation:** Code runs in sandboxed environments
* **Scalable sync:** Stateless collaboration server with persistence layer

This separation ensures **low latency collaboration**, **safe execution**, and **horizontal scalability**.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Monaco Editor (`@monaco-editor/react`)
* Framer Motion
* Lucide React

### Collaboration

* Y.js
* Y-WebSocket
* Y-Monaco

### Backend

* Node.js
* Express.js
* WebSocket (`ws`)

### Persistence & Execution

* Y-LevelDB (server-side persistence)
* MongoDB for persistence User and Rooms
* LocalStorage (client-side)
* Piston API (secure sandboxed code execution)

---

## 🚀 Getting Started

> ⚠️ **Note:** Hexode is under active development. APIs and features may evolve.

You can run Hexode locally with or without Docker.

---

### ▶️ Option 1: Manual Setup (Recommended for Development)

**Prerequisites:** Node.js (v18+ recommended)

#### 1️⃣ Start the Backend Server

```bash
cd server
npm install
npm run dev
```

Runs on [**http://localhost:3001**](http://localhost:3001) (API + WebSocket)

#### 2️⃣ Start the Frontend Client

```bash
cd client
npm install
npm run dev
```

Open [**http://localhost:5173**](http://localhost:5173) in your browser.

---

### 🐳 Option 2: Docker Compose (Production-Ready)

```bash
docker-compose up --build
```

* Client → `http://localhost:80`
* Server → `http://localhost:3001`

---

## ☁️ Deployment

Hexode is optimized for **free-tier cloud deployments**.

### Frontend (Client)

Deploy the `client` folder to **Vercel** or **Netlify**.

Environment variables:

```env
VITE_API_URL=https://your-backend-url
VITE_WS_URL=wss://your-backend-url
```

### Backend (Server)

Deploy the `server` folder to **Render** or **Railway**.

---

## 🌐 Live Demo

> 🔗 **Live URL:** *(https://hexode.vercel.app)*

---

## 🗺️ Roadmap

Planned and upcoming improvements:

* WILL BE SHARED SOON

---

## 🤝 Contributing

Contributions are welcome and appreciated! 🎉

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add awesome feature"`)
4. Push to your branch
5. Open a Pull Request

### Contribution Guidelines

* Keep commits small and focused
* Follow existing code style
* Add comments where logic is complex
* Test your changes before submitting

---

## 📜 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built with ❤️ by **Sourav Paitandy**
🌐 [https://www.souravpaitandy.me](https://www.souravpaitandy.me)

---

> **Hexode — Code. Run. Collaborate.**
>
> *Build together. Learn faster. Ship smarter.*
