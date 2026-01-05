import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import ProductTour from "../components/ProductTour";
import { useToast } from "../components/Toast";
import IDEHeader from "../components/ide/IDEHeader";
import TerminalPanel from "../components/ide/TerminalPanel";
import StatusBar from "../components/ide/StatusBar";
import NotFound from "./NotFound";
import { useTheme } from "../context/ThemeContext";
import { useModal } from "../context/ModalContext";
import SEO from "../components/SEO";

const IDE = () => {
  const { theme } = useTheme();
  const { roomId } = useParams();
  // const navigate = useNavigate();
  const { confirm } = useModal();
  const isPlayground = roomId === "test";
  const testSessionId = useRef(
    "playground-" + Math.random().toString(36).substr(2, 9)
  ).current;

  const [searchParams] = useSearchParams();
  const urlViewMode = searchParams.get("mode") === "view";
  const { user, isSignedIn, isLoaded } = useUser();
  const [lastSaved, setLastSaved] = useState(null);

  const [roomOwnerId, setRoomOwnerId] = useState(null);
  const [isGuestEditAllowed, setIsGuestEditAllowed] = useState(false);

  // Security: Enforce View Mode if current user is NOT the owner
  const isOwner = useMemo(() => {
    if (isPlayground) return true; // Playground is always editable
    if (!roomOwnerId) return true; // Default to allow edit if anonymous/new room
    if (!isSignedIn || !user) return false;
    return user.id === roomOwnerId;
  }, [roomOwnerId, isSignedIn, user, isPlayground]);

  const isViewMode = urlViewMode || (!isOwner && !isGuestEditAllowed);

  // Mobile / Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile && !isPlayground); // Hide sidebar in playground

  const [editorRef, setEditorRef] = useState(null);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("terminal");
  const [stdin, setStdin] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Smart Autosave (Debounced)
  const saveTimeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isNotFound, setIsNotFound] = useState(false);
  // Allow MongoDB ObjectIDs OR "proj-XXXX" format
  const isValidProjectId = (id) => /^(proj-\d+|[0-9a-fA-F]{24})$/.test(id);

  useEffect(() => {
    if (isViewMode || !window.currentYDoc) return;

    const ydoc = window.currentYDoc;

    const performSave = async () => {
      setIsSaving(true);
      try {
        if (isSignedIn && !isPlayground) {
          const fileMap = ydoc.getMap("project-files");
          const serializedFiles = {};

          Array.from(fileMap.keys()).forEach((filename) => {
            serializedFiles[filename] = ydoc.getText(filename).toString();
          });

          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:3001";
          await axios.post(`${API_URL}/api/rooms`, {
            roomId,
            ownerId: user.id,
            files: serializedFiles,
            isGuestEditAllowed, // Persist setting
          });
          if (process.env.NODE_ENV === "development") {
            console.log("Autosave successful", serializedFiles);
          }
        } else {
          // Guest mode: Rely on Yjs/LevelDB sync (simulated "save" delay)
          await new Promise((r) => setTimeout(r, 500));
        }
        setLastSaved(new Date());
      } catch (e) {
        console.error("Autosave failed", e);
      } finally {
        setIsSaving(false);
      }
    };

    const handleUpdate = () => {
      // User typed something or files changed
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setIsSaving(true); // Immediate feedback that we are "dirty"
      saveTimeoutRef.current = setTimeout(performSave, 2000); // Save after 2s of inactivity
    };

    ydoc.on("update", handleUpdate);

    return () => {
      ydoc.off("update", handleUpdate);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [isSignedIn, isViewMode, roomId, isConnected]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Don't auto-close on mobile - let user control sidebar manually
      // Only auto-show when switching to desktop
      if (!mobile && !showSidebar) {
        setShowSidebar(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showSidebar]);

  useEffect(() => {
    if (isPlayground) setShowSidebar(false);
  }, [isPlayground]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S: Trigger manual save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isSignedIn && !isViewMode && window.currentYDoc) {
          const ydoc = window.currentYDoc;
          const fileMap = ydoc.getMap("project-files");
          const serializedFiles = {};

          Array.from(fileMap.keys()).forEach((filename) => {
            serializedFiles[filename] = ydoc.getText(filename).toString();
          });

          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:3001";
          axios
            .post(`${API_URL}/api/rooms`, {
              roomId,
              ownerId: user.id,
              files: serializedFiles,
            })
            .then(() => {
              addToast("Project saved to cloud successfully.", "success", 2000);
              setLastSaved(new Date());
            })
            .catch((err) => {
              addToast(`Save failed, ${err.message}`, "error", 10000);
            });
        }
      }

      // Ctrl+Enter or Cmd+Enter: Run code
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          runCode();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSignedIn, isViewMode, roomId, user, isRunning]);

  // File System State
  const [fileName, setFileName] = useState("script.js");
  const [files, setFiles] = useState([]);

  // User State
  const [guestUser] = useState(() => {
    const names = [
      "Captain Code",
      "Git Guru",
      "Docker Dave",
      "React Ranger",
      "Node Ninja",
      "Cyber Punk",
      "Algo Master",
    ];
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0088ff",
      "#ff00ff",
      "#00ffff",
      "#ffaa00",
      "#aa00ff",
    ];
    return {
      name:
        names[Math.floor(Math.random() * names.length)] +
        " #" +
        Math.floor(Math.random() * 1000),
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  // useMemo to prevent object reference change on every render (which triggers the massive useEffect)
  const currentUser = useMemo(() => {
    return isSignedIn && user
      ? {
          name: user.fullName || user.firstName || "Dev",
          color: guestUser.color,
        }
      : guestUser;
  }, [isSignedIn, user, guestUser]);

  const { addToast, removeToast } = useToast();

  // Layout State
  const [layout, setLayout] = useState({
    sidebarW: 250,
    terminalH: 220,
    chatW: 400,
  });
  const isResizing = useRef(null); // 'sidebar' | 'terminal' | 'chat'

  // 1. Initialize Y.js and Provider (Once)
  useEffect(() => {
    // setUser({ name: randomName, color: randomColor }); // Legacy logic removed

    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);

    const ydoc = new Y.Doc();
    const room = isPlayground ? testSessionId : roomId || "monaco-demo";
    // Auto-derive WS URL from API URL if not explicitly set
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const WS_URL =
      import.meta.env.VITE_WS_URL || API_URL.replace(/^http/, "ws");

    const provider = new WebsocketProvider(WS_URL, room, ydoc);

    provider.awareness.setLocalStateField("user", currentUser);

    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const myClientId = provider.awareness.clientID;
      let css = "";
      states.forEach((state, clientId) => {
        if (
          clientId !== myClientId &&
          state.user &&
          state.user.name &&
          state.user.color
        ) {
          css += `.yRemoteSelectionHead-${clientId} { border-color: ${state.user.color} !important; }`;
          css += `.yRemoteSelection-${clientId} { background-color: ${state.user.color}50 !important; }`;
          css += `.yRemoteSelectionHead-${clientId}::after { content: "${state.user.name}"; position: absolute; top: -22px; left: -2px; background-color: ${state.user.color}; color: black; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 1000; font-family: 'Inter', sans-serif; }`;
        }
      });
      styleSheet.innerText = css;
    });

    // Handle Connection Status
    const handleStatusChange = ({ status }) => {
      const connected = status === "connected";
      setIsConnected(connected);
      if (connected) {
        // Only toast if we were previously disconnected (to avoid spam on initial load)
        // Using a Ref to track previous state if needed, but for now simple 'connected' toast is fine
        // Or better: show "Syncing..." transiently?
        // Let's rely on IDEHeader Visual Indicator primarily, and Toast for Offline.
      }
    };
    provider.on("status", handleStatusChange);

    // Global Online/Offline Listeners
    const handleOnline = () => {
      addToast("Back Online. Syncing changes...", "success", 3000);
      // Provider should auto-reconnect, but we can force it just in case
      if (!provider.shouldConnect) provider.connect();
    };
    const handleOffline = () => {
      addToast("You are Offline. Changes saved locally.", "warning", 5000);
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setIsConnected(false);
    }

    const initProject = async () => {
      const yFilesMap = ydoc.getMap("project-files");
      // Always fetch room metadata to check ownership, even if Yjs is synced
      try {
        let dbFiles = null;
        let projectLang = "JavaScript";

        if (!isPlayground) {
          // Validation: If not playground/demo and invalid ID format -> 404
          // But if it looks valid (e.g. proj-123), we try to fetch.
          // If fetch fails (404), we allow it to fall back to local creation (for guests).
          const room = roomId || "monaco-demo";
          if (room !== "monaco-demo" && !isValidProjectId(room)) {
            setIsNotFound(true);
            return;
          }

          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:3001";
          try {
            const res = await axios.get(
              `${API_URL}/api/rooms/${roomId || "monaco-demo"}`
            );

            if (res.data?.ownerId) {
              setRoomOwnerId(res.data.ownerId);
            }
            if (res.data?.isGuestEditAllowed) {
              setIsGuestEditAllowed(res.data.isGuestEditAllowed);
            }

            if (res.data?.lang) {
              projectLang = res.data.lang;
            }
            dbFiles = res.data?.files;
          } catch (e) {
            // Note: We do NOT 404 here anymore.
            // If API fails, it might be a local-only project (guest mode).
            // We proceed to Yjs sync/fallback.
            console.warn(
              "DB Fetch failed or skipped (proceeding to local/Yjs)",
              e
            );
          }
        }

        if (yFilesMap.size === 0) {
          if (dbFiles && Object.keys(dbFiles).length > 0) {
            if (process.env.NODE_ENV === "development") {
              console.log("Hydrating from DB...");
            }
            Object.entries(dbFiles).forEach(([name, content]) => {
              yFilesMap.set(name, true);
              const text = ydoc.getText(name);
              if (text.toString().length === 0) text.insert(0, content);
            });
            setFileName(Object.keys(dbFiles)[0]);
          } else {
            // Default / Demo / Playground Setup
            const room = roomId || "monaco-demo";

            if (isPlayground) {
              if (!yFilesMap.has("playground.js")) {
                yFilesMap.set("playground.js", true);
                ydoc
                  .getText("playground.js")
                  .insert(
                    0,
                    "// Hexode Playground\n// Write code here. Changes are NOT saved.\n// Press 'Run' to execute.\n\nconsole.log('Hello from the Playground!');\n"
                  );
                setFileName("playground.js");
              }
            } else if (room === "monaco-demo" || !dbFiles) {
              let filename = "index.js";
              let content =
                "// Welcome to Hexode!\nconsole.log('Hello World');";

              // Language-specific defaults
              if (projectLang === "Java") {
                filename = "Main.java";
                content =
                  'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello from Java!");\n  }\n}';
              } else if (projectLang === "Python") {
                filename = "main.py";
                content = 'print("Hello from Python!")';
              } else if (projectLang === "C++") {
                filename = "main.cpp";
                content =
                  '#include <iostream>\n\nint main() {\n  std::cout << "Hello from C++" << std::endl;\n  return 0;\n}';
              } else if (projectLang === "C") {
                filename = "main.c";
                content =
                  '#include <stdio.h>\n\nint main() {\n  printf("Hello from C\\n");\n  return 0;\n}';
              }

              yFilesMap.set(filename, true);
              ydoc.getText(filename).insert(0, content);
              setFileName(filename);

              // Add utils.js only for JavaScript projects as a bonus/demo
              if (
                projectLang === "JavaScript" &&
                !yFilesMap.has("src/utils.js")
              ) {
                yFilesMap.set("src/utils.js", true);
                ydoc
                  .getText("src/utils.js")
                  .insert(
                    0,
                    "const add = (a, b) => a + b;\nmodule.exports = { add };"
                  );
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to hydrate project:", err);
        // Fallback to default if DB fails (e.g. offline/new)
        if (yFilesMap.size === 0) {
          yFilesMap.set("index.js", true);
          ydoc
            .getText("index.js")
            .insert(0, "// Welcome to DevDock!\nconsole.log('Hello World');");
          setFileName("index.js");
        }
      }
      setFiles(Array.from(yFilesMap.keys()));
      setIsHydrating(false);
    };

    // Wait for sync before initializing to avoid overwriting/duplicating
    provider.on("synced", (synced) => {
      if (synced) {
        setIsConnected(true);
        initProject();
      }
    });

    // Also init if it takes too long?
    // No, if no sync, then we are offline. We should probably show offline state.
    // If we init locally while offline, and then sync, Yjs handles it.
    // But duplicate content comes from us inserting "Hello World" into an empty doc
    // that actually has "Hello World" on the server but we haven't received it yet.
    // So Waiting for 'synced' is critical.

    const yFilesMap = ydoc.getMap("project-files");
    yFilesMap.observe(() => {
      setFiles(Array.from(yFilesMap.keys()));
    });

    // setTimeout(initProject, 500); // RACE CONDITION REMOVED

    window.currentYDoc = ydoc;
    window.currentProvider = provider;

    return () => {
      provider.destroy();
      ydoc.destroy();
      document.head.removeChild(styleSheet);
    };
  }, [roomId, currentUser, isSignedIn, isViewMode]);

  // 2. Bind Editor to CURRENT File
  useEffect(() => {
    if (!editorRef || !window.currentYDoc || !window.currentProvider) return;

    const ydoc = window.currentYDoc;
    const provider = window.currentProvider;

    const ytext = ydoc.getText(fileName);
    const binding = new MonacoBinding(
      ytext,
      editorRef.getModel(),
      new Set([editorRef]),
      provider.awareness
    );

    return () => {
      binding.destroy();
    };
  }, [editorRef, fileName]);

  const handleEditorDidMount = (editor, monaco) => {
    setEditorRef(editor);
  };

  const getBoilerplate = (filename) => {
    if (filename.endsWith(".java")) {
      const className = filename.replace(".java", "") || "Main";
      // Ensure valid java identifier for class name (simple check)
      const safeClassName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/.test(className)
        ? className
        : "Main";
      return `public class ${safeClassName} {\n    public static void main(String[] args) {\n        System.out.println("Hello Java");\n    }\n}`;
    }
    if (filename.endsWith(".py")) return `print("Hello Python")`;
    if (
      filename.endsWith(".js") ||
      filename.endsWith(".cjs") ||
      filename.endsWith(".mjs")
    )
      return `console.log("Hello JS")`;
    if (filename.endsWith(".cpp"))
      return `#include <iostream>\n\nint main() {\n    std::cout << "Hello C++" << std::endl;\n    return 0;\n}`;
    if (filename.endsWith(".c"))
      return `#include <stdio.h>\n\nint main() {\n    printf("Hello C\\n");\n    return 0;\n}`;
    return "";
  };

  const handleCreateFile = (name) => {
    if (isViewMode) return; // Prevent changes in view mode
    if (window.currentYDoc) {
      const map = window.currentYDoc.getMap("project-files");

      // File count limit (50 files max)
      if (map.size >= 50) {
        addToast("error", "File limit reached", "Maximum 50 files per project");
        return;
      }

      if (map.has(name)) {
        // File already exists! Switch to it but don't overwrite.
        setFileName(name);
        return;
      }

      const content = getBoilerplate(name);

      // File size limit (1MB per file)
      if (content && content.length > 1024 * 1024) {
        addToast("error", "File too large", "Boilerplate exceeds 1MB limit");
        return;
      }

      map.set(name, true);
      if (content) {
        const text = window.currentYDoc.getText(name);
        if (text.toString().length === 0) {
          // Double check emptiness
          text.insert(0, content);
        }
      }
      setFileName(name);
    }
  };

  const handleDeleteFile = (name) => {
    if (isViewMode) return;
    if (window.currentYDoc) {
      const map = window.currentYDoc.getMap("project-files");

      // Prevent deleting the last file (Pre-check)
      if (Array.from(map.keys()).length <= 1) {
        addToast("Cannot delete the last file.", "error", 3000);
        return;
      }

      confirm({
        title: "Delete File?",
        message: `Are you sure you want to permanently delete '${name}'?`,
        confirmText: "Delete",
        type: "danger",
        onConfirm: () => {
          map.delete(name);
          if (fileName === name) {
            const keys = Array.from(map.keys());
            if (keys.length > 0) setFileName(keys[0]);
            else setFileName("script.js");
          }
        },
      });
    }
  };

  const handleRenameFile = (oldName, newName) => {
    if (isViewMode) return; // Prevent changes in view mode
    if (window.currentYDoc && oldName !== newName) {
      const map = window.currentYDoc.getMap("project-files");
      const oldContent = window.currentYDoc.getText(oldName).toString();
      map.set(newName, true);
      window.currentYDoc.getText(newName).insert(0, oldContent);
      map.delete(oldName);
      if (fileName === oldName) setFileName(newName);
    }
  };

  const getLanguage = (filename) => {
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".cjs")) return "javascript";
    if (filename.endsWith(".mjs")) return "javascript";
    if (filename.endsWith(".py")) return "python";
    if (filename.endsWith(".java")) return "java";
    if (filename.endsWith(".c")) return "c";
    if (filename.endsWith(".cpp")) return "cpp";
    return "javascript";
  };

  // Resize Handlers
  const startResizing = (direction) => (e) => {
    isResizing.current = direction;
    document.body.style.cursor =
      direction === "terminal" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none"; // Prevent text selection
  };

  const stopResizing = useCallback(() => {
    isResizing.current = null;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isResizing.current) return;

    if (isResizing.current === "sidebar") {
      const newW = e.clientX;
      if (newW > 150 && newW < 600)
        setLayout((prev) => ({ ...prev, sidebarW: newW }));
    }
    if (isResizing.current === "chat") {
      const newW = window.innerWidth - e.clientX;
      if (newW > 250 && newW < 600)
        setLayout((prev) => ({ ...prev, chatW: newW }));
    }
    if (isResizing.current === "terminal") {
      const newH = window.innerHeight - e.clientY;
      if (newH > 100 && newH < window.innerHeight - 100)
        setLayout((prev) => ({ ...prev, terminalH: newH }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [onMouseMove, stopResizing]);

  // Handle code insertion from AI
  const handleInsertCode = (code) => {
    if (!editorRef) return;

    const position = editorRef.getPosition();
    const selection = editorRef.getSelection();

    editorRef.executeEdits("", [
      {
        range: selection || {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: code,
      },
    ]);

    // Focus editor after insertion
    editorRef.focus();
  };

  const toggleGuestAccess = async () => {
    const newValue = !isGuestEditAllowed;
    setIsGuestEditAllowed(newValue);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      await axios.put(`${API_URL}/api/rooms/${roomId}`, {
        isGuestEditAllowed: newValue,
        // Backend expects name/lang too? Actually PUT merges updates usually, let's check server logic.
        // Server logic: `if (name) room.name = name; ...`. Logic looks safe for partial updates.
      });
      const status = newValue ? "enabled" : "disabled";
      addToast(`Guest Edit Access ${status}.`, "success", 2000);
    } catch (err) {
      setIsGuestEditAllowed(!newValue); // Revert
      addToast("Failed to update access settings.", "error", 3000);
    }
  };

  const runCode = async (customStdin = null) => {
    if (!editorRef) return;
    setIsRunning(true);
    setActiveTab("terminal");

    // Toast: Started
    const toastId = addToast("Executing code...", "loading", 0);

    const code = editorRef.getValue();
    const lang = getLanguage(fileName);

    // Use customStdin if passed (interactive flow), else use state stdin
    const stdinToUse = customStdin !== null ? customStdin : stdin;

    // Log for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[EXEC] Sending Request: Language=${lang}, Stdin=${stdinToUse}`
      );
    }

    // Calculate all files
    let projectFiles = [];
    if (window.currentYDoc) {
      const ydoc = window.currentYDoc;
      const fileMap = ydoc.getMap("project-files");

      // Active file MUST be first for Piston to run it as entry point (usually)
      projectFiles.push({
        name: fileName,
        content: code, // Use editor content to ensure latest unsaved keystrokes
      });

      Array.from(fileMap.keys()).forEach((fname) => {
        if (fname !== fileName) {
          const content = ydoc.getText(fname).toString();
          projectFiles.push({ name: fname, content });
        }
      });
    } else {
      // Fallback
      projectFiles = [{ name: fileName, content: code }];
    }

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: projectFiles,
          language: lang,
          stdin: stdinToUse,
        }),
      });

      const data = await response.json();

      // Remove loading toast
      removeToast(toastId);

      if (data.run) {
        const lines = data.run.output?.split("\n") || [];
        setTerminalHistory((prev) => [
          ...prev,
          { type: "system", content: "> Executing code..." },
        ]);
        lines.forEach((line) => {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "output", content: line },
          ]);
        });

        addToast("Execution Successful", "success", 2000);
      } else {
        setTerminalHistory((prev) => [
          ...prev,
          { type: "error", content: "Execution failed" },
          { type: "error", content: data.message || "Unknown error" },
        ]);
        addToast("Execution Failed", "error", 4000);
      }
    } catch (error) {
      removeToast(toastId);
      setTerminalHistory((prev) => [
        ...prev,
        { type: "error", content: `Error: ${error.message}` },
        { type: "error", content: "Check server logs for details." },
      ]);
      addToast("Network Error", "error", 4000);
    } finally {
      setIsRunning(false);
    }
  };

  /* Terminal State Machine */
  const [terminalMode, setTerminalMode] = useState("COMMAND"); // COMMAND | AWAITING_STDIN

  // Handle "Run" button click from Header
  const handleRunClick = () => {
    // Check if we should skip stdin? For now, let's keep consistency and ask for Stdin.
    // If user wants to skip, they can just press Enter.
    setTerminalMode("AWAITING_STDIN");
    setActiveTab("terminal"); // Ensure terminal is visible
    setTerminalHistory((prev) => [
      ...prev,
      {
        type: "system",
        content: "Enter standard input (press Enter to skip):",
      },
    ]);
  };

  const handleTerminalCommand = (cmd) => {
    // Handling Stdin Input Mode
    if (terminalMode === "AWAITING_STDIN") {
      setTerminalHistory((prev) => [
        ...prev,
        { type: "command", content: cmd }, // Echo the input
        { type: "system", content: "Input captured. Running..." },
      ]);
      setStdin(cmd);
      setTerminalMode("COMMAND");

      // Trigger run immediately with the captured stdin
      // We need to set stdin state, but runCode reads 'stdin' state which might not be updated yet due to closure/react batching.
      // So we pass it directly or use a ref.
      // Better: Pass stdin argument to runCode.
      runCode(cmd);
      return;
    }

    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Add command to history
    setTerminalHistory((prev) => [
      ...prev,
      { type: "command", content: trimmed, user: currentUser.name },
    ]);

    const [command, ...args] = trimmed.split(" ");

    switch (command) {
      case "clear":
        setTerminalHistory([]);
        break;
      case "cls":
        setTerminalHistory([]);
        break;
      case "help":
        setTerminalHistory((prev) => [
          ...prev,
          {
            type: "output",
            content:
              "Available commands:\n  ls            List files\n  cat <file>    Read file content\n  run           Run current code (Interactive)\n  run --force   Run without waiting for stdin\n  clear / cls   Clear terminal\n  whoami        Show current user",
          },
        ]);
        break;
      case "ls":
        setTerminalHistory((prev) => [
          ...prev,
          { type: "output", content: files.join("\n") },
        ]);
        break;
      case "whoami":
        setTerminalHistory((prev) => [
          ...prev,
          { type: "output", content: currentUser.name },
        ]);
        break;
      case "cat":
        if (args.length === 0) {
          setTerminalHistory((prev) => [
            ...prev,
            { type: "error", content: "Usage: cat <filename>" },
          ]);
        } else {
          const targetFile = args[0];
          if (window.currentYDoc) {
            const yFilesMap = window.currentYDoc.getMap("project-files");
            if (yFilesMap.has(targetFile)) {
              const content = window.currentYDoc.getText(targetFile).toString();
              setTerminalHistory((prev) => [
                ...prev,
                { type: "output", content: content },
              ]);
            } else {
              setTerminalHistory((prev) => [
                ...prev,
                { type: "error", content: `File not found: ${targetFile}` },
              ]);
            }
          }
        }
        break;
      case "run":
        // Check for args to skip stdin?
        if (args.length > 0 && args[0] === "--force") {
          runCode("");
        } else {
          // Enter Interactive Stdin Mode
          setTerminalMode("AWAITING_STDIN");
          setTerminalHistory((prev) => [
            ...prev,
            {
              type: "system",
              content: "Enter standard input (press Enter to skip):",
            },
          ]);
        }
        break;

      /* REMOVED: explicit 'stdin' command is now deprecated in favor of interactive flow, 
         but keeping it for backward compatibility if user wants to use it? 
         Nah, let's remove it to enforce the new flow as requested "on the go". 
      */

      default:
        setTerminalHistory((prev) => [
          ...prev,
          { type: "error", content: `Command not found: ${command}` },
        ]);
    }
  };

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <SEO
        title={
          isPlayground ? "Hexode Playground - Online IDE & Compiler" : "Editor"
        }
        description={
          isPlayground
            ? "Run Java, Python, C++, C, and JavaScript code online instantly. No setup, instant execution for DSA and interviews."
            : "Real-time Collaborative Code Editor. Build software together with Hexode."
        }
        keywords={
          isPlayground
            ? "online compiler, online ide, java compiler, python online, c++ compiler, dsa practice, interview sandbox"
            : "cloud ide, collaborative editor, pair programming"
        }
      />
      {/* Auth Loading State - Critical for preventing Guest Fallback on Refresh */}
      {!isLoaded ? (
        <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-muted">Loading environment...</p>
          </div>
        </div>
      ) : (
        <>
          <IDEHeader
            roomId={roomId}
            user={user}
            fileName={fileName}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            runCode={handleRunClick}
            isRunning={isRunning}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            isViewMode={isViewMode}
            isSaving={isSaving}
            lastSaved={lastSaved}
            isConnected={isConnected}
            isOwner={isOwner}
            isGuestEditAllowed={isGuestEditAllowed}
            onToggleGuestAccess={toggleGuestAccess}
            isPlayground={isPlayground}
          />

          {/* Main Workspace */}
          {/* Autosave & View Mode logic */}
          {/* If View Mode, maybe show banner? */}
          {isViewMode && (
            <div className="bg-amber-500/10 text-amber-500 px-4 py-1 text-xs text-center border-b border-amber-500/20 font-bold">
              VIEW ONLY MODE
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Sidebar Container (Desktop: Resizable, Mobile: Drawer) */}
            {(!isMobile || showSidebar) && (
              <div
                style={{ width: isMobile ? "80%" : layout.sidebarW }}
                className={`flex flex-col shrink-0 ${
                  isMobile
                    ? "fixed inset-y-0 left-0 z-50 shadow-2xl bg-surface"
                    : ""
                }`}
              >
                <Sidebar
                  files={files}
                  activeFile={fileName}
                  onSelect={(f) => {
                    setFileName(f);
                    if (isMobile) setShowSidebar(false);
                  }}
                  onCreate={handleCreateFile}
                  onDelete={handleDeleteFile}
                  onRename={handleRenameFile}
                  isViewMode={isViewMode}
                  isPlayground={isPlayground}
                />
              </div>
            )}

            {/* Mobile Sidebar Backdrop */}
            {isMobile && showSidebar && (
              <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setShowSidebar(false)}
              />
            )}

            {/* Resizer: Sidebar <-> Editor (Desktop Only) */}
            {!isMobile && (
              <div
                onMouseDown={startResizing("sidebar")}
                className="w-1 bg-surface hover:bg-blue-500 cursor-col-resize border-x border-border transition-colors z-10"
              />
            )}

            {/* Center: Editor + Terminal */}
            <div className="flex-1 min-w-0 flex flex-col bg-card">
              {/* Editor Area */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  defaultLanguage={getLanguage(fileName)}
                  language={getLanguage(fileName)}
                  path={fileName}
                  defaultValue="// Loading..."
                  theme={theme === "dark" ? "vs-dark" : "light"}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    padding: { top: 16 },
                    fontFamily: "JetBrains Mono, monospace",
                    scrollbar: { vertical: "hidden" },
                    readOnly: isViewMode, // View Mode
                  }}
                />
              </div>

              {/* Resizer: Editor <-> Terminal */}
              <div
                onMouseDown={startResizing("terminal")}
                className="h-1 bg-surface hover:bg-blue-500 cursor-row-resize border-y border-border transition-colors z-10"
              />

              {/* Terminal Area */}
              <TerminalPanel
                height={layout.terminalH}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                history={terminalHistory} // Changed prop
                onCommand={handleTerminalCommand} // New prop
                stdin={stdin}
                setStdin={setStdin}
                user={currentUser}
                roomId={roomId}
                terminalMode={terminalMode}
                isPlayground={isPlayground}
              />
            </div>

            {/* Chat Resizer (only if open) */}
            {isChatOpen && (
              <div
                onMouseDown={startResizing("chat")}
                className="w-1 bg-surface hover:bg-blue-500 cursor-col-resize border-l border-border transition-colors z-10"
              />
            )}

            {/* Chat Panel */}
            {/* Chat Panel (Desktop: Resizable, Mobile: Drawer) */}
            {isChatOpen && !isPlayground && (
              <>
                <div
                  style={{ width: isMobile ? "85%" : layout.chatW }}
                  className={`shrink-0 ${
                    isMobile
                      ? "fixed inset-y-0 right-0 z-50 shadow-2xl bg-surface border-l border-border"
                      : ""
                  }`}
                >
                  <Chat
                    ydoc={window.currentYDoc}
                    provider={window.currentProvider}
                    username={currentUser.name}
                    color={currentUser.color}
                    onClose={() => setIsChatOpen(false)}
                    roomId={roomId}
                    fileName={fileName}
                    onInsertCode={handleInsertCode}
                  />
                </div>
                {/* Mobile Chat Backdrop */}
                {isMobile && (
                  <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setIsChatOpen(false)}
                  />
                )}
              </>
            )}
          </div>

          {/* Status Bar */}
          <StatusBar
            fileCount={files.length}
            username={currentUser.name}
            fileName={fileName}
          />
        </>
      )}

      {/* Product Tour for first-time users */}
      <ProductTour className="hidden md:block" />
    </div>
  );
};

export default IDE;
