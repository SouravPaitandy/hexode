# Hexode Client

React-based frontend for Hexode collaborative IDE.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit: `http://localhost:5173`

## 📦 Tech Stack

- **React 18** + **Vite**
- **Monaco Editor** - VS Code's editor
- **Yjs** - Real-time collaboration
- **Clerk** - Authentication
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icons

## 🔧 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional - Google Analytics
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── ide/            # IDE-specific components
│   ├── Chat.jsx        # Real-time chat
│   ├── Sidebar.jsx     # File tree
│   ├── Toast.jsx       # Notifications
│   ├── ProductTour.jsx # Onboarding tour
│   └── ErrorBoundary.jsx
├── pages/              # Page components
│   ├── Landing.jsx     # Landing page
│   ├── Dashboard.jsx   # Project dashboard
│   └── IDE.jsx         # Main IDE
├── utils/              # Utilities
│   ├── analytics.js    # GA4 tracking
│   └── fileSystem.js   # File operations
├── context/            # React contexts
│   └── ThemeContext.jsx
└── App.jsx             # Main app component
```

## ✨ Key Features

### Product Tour & Landing Page

- 8-step interactive onboarding for new users with spotlight highlighting.
- Fully interactive polyglot landing page mockup with dynamic code execution and HexodeAI demonstration.

### Distraction-Free Fullscreen

Toggle native fullscreen mode via the IDE header or `F11` for an immersive coding environment.

### Keyboard Shortcuts

- **Ctrl+S** / **Cmd+S**: Save project
- **Ctrl+Enter** / **Cmd+Enter**: Run code
- **Ctrl+B** / **Cmd+B**: Toggle file explorer sidebar
- **Ctrl+M** / **Cmd+M**: Toggle HexodeAI Chat panel
- **Ctrl+N** / **Cmd+N**: Initialize new workspace (Dashboard)
- **Ctrl+K** / **Cmd+K**: Focus project search (Dashboard)
- **F11**: Toggle Fullscreen Mode

### Auto-Save

Debounced auto-save every 2 seconds with visual indicator.

### Real-Time Collaboration

Live code editing powered by Yjs CRDT.

## 🎨 Customization

### Theme

Toggle dark/light theme via theme button in header. 

Includes 4 custom premium themes out-of-the-box:
- **Neon Nights** (Cyberpunk aesthetic)
- **Oceanic Abyss** (Deep sea blue)
- **Rose Pine Dawn** (Warm light aesthetic)
- **Arctic Frost** (Crisp icy light)

### Monaco Editor

Configure in `IDE.jsx`:

```javascript
<Editor
  theme={theme === "dark" ? "vs-dark" : "light"}
  options={{
    fontSize: 14,
    minimap: { enabled: false },
    // Add more options
  }}
/>
```

## 📊 Analytics

Track user events with Google Analytics 4:

1. Get GA4 Measurement ID
2. Add to `.env`: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
3. Events auto-tracked: project creation, code execution, file operations

## 🏗️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle
npm run build
npx vite-bundle-visualizer
```

## 🧪 Development

```bash
# Run dev server
npm run dev

# Lint
npm run lint
```

## 📝 Notes

- Clear localStorage to reset product tour: `localStorage.removeItem('hexode-tour-completed')`
- Monaco Editor is the largest dependency (~3MB)
- Consider code splitting for production optimization
