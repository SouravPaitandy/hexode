import { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";
import { useToast } from "../components/Toast";
import IDEHeader from "../components/ide/IDEHeader";
import TerminalPanel from "../components/ide/TerminalPanel";
import StatusBar from "../components/ide/StatusBar";
import { useTheme } from "../context/ThemeContext";

const IDE = () => {
  const { theme } = useTheme();
  // ... existing code ...
  const { roomId } = useParams();
  const [editorRef, setEditorRef] = useState(null);
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'Welcome to DevDock Shell' },
    { type: 'system', content: 'Type "help" for available commands.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("terminal"); // terminal | input | console | problems
  const [stdin, setStdin] = useState("");
  
  // Mobile / Responsive State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  useEffect(() => {
      const handleResize = () => {
          const mobile = window.innerWidth < 768;
          setIsMobile(mobile);
          if (mobile) setShowSidebar(false);
          else setShowSidebar(true);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // File System State
  const [fileName, setFileName] = useState("script.js"); 
  const [files, setFiles] = useState([]); 

  // User State
  const [user, setUser] = useState({ name: "Anonymous", color: "#ccc" });

  const { addToast, removeToast } = useToast();

  // Layout State
  const [layout, setLayout] = useState({ sidebarW: 250, terminalH: 220, chatW: 300 });
  const isResizing = useRef(null); // 'sidebar' | 'terminal' | 'chat'

  // 1. Initialize Y.js and Provider (Once)
  useEffect(() => {
    const names = ["Captain Code", "Git Guru", "Docker Dave", "React Ranger", "Node Ninja", "Cyber Punk", "Algo Master"];
    const colors = ["#ff0000", "#00ff00", "#0088ff", "#ff00ff", "#00ffff", "#ffaa00", "#aa00ff"];
    const randomName = names[Math.floor(Math.random() * names.length)] + " #" + Math.floor(Math.random() * 1000);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setUser({ name: randomName, color: randomColor });

    const styleSheet = document.createElement("style");
    document.head.appendChild(styleSheet);

    const ydoc = new Y.Doc();
    const room = roomId || "monaco-demo";
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001"; 
    const provider = new WebsocketProvider(WS_URL, room, ydoc);

    provider.awareness.setLocalStateField("user", { name: randomName, color: randomColor });
    
    provider.awareness.on('change', () => {
        const states = provider.awareness.getStates();
        const myClientId = provider.awareness.clientID;
        let css = "";
        states.forEach((state, clientId) => {
            if (clientId !== myClientId && state.user && state.user.name && state.user.color) {
                css += `.yRemoteSelectionHead-${clientId} { border-color: ${state.user.color} !important; }`;
                css += `.yRemoteSelection-${clientId} { background-color: ${state.user.color}50 !important; }`;
                css += `.yRemoteSelectionHead-${clientId}::after { content: "${state.user.name}"; position: absolute; top: -22px; left: -2px; background-color: ${state.user.color}; color: black; font-size: 11px; font-weight: bold; padding: 2px 6px; border-radius: 4px; z-index: 1000; font-family: 'Inter', sans-serif; }`;
            }
        });
        styleSheet.innerText = css;
    });

    const yFilesMap = ydoc.getMap("project-files");
    
    const initProject = () => {
        if (yFilesMap.size === 0) {
            const DEMO_CODE = {
                "demo-python": { name: "main.py", content: "name = input('Enter your name: ')\nprint(f'Hello, {name}!')" },
                "demo-java": { name: "Main.java", content: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.println(\"Enter name: \");\n        if(scanner.hasNext()){ \n            String name = scanner.nextLine();\n            System.out.println(\"Hello \" + name);\n        }\n    }\n}" },
                "demo-cpp": { name: "main.cpp", content: "#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << \"Enter name: \";\n    std::cin >> name;\n    std::cout << \"Hello \" << name << std::endl;\n    return 0;\n}" }
            };

            const room = roomId || "monaco-demo";
            if (DEMO_CODE[room]) {
                const { name, content } = DEMO_CODE[room];
                yFilesMap.set(name, true);
                ydoc.getText(name).insert(0, content);
                setFileName(name);
            } else {
                // Default JS Project with folders
                yFilesMap.set("index.js", true);
                ydoc.getText("index.js").insert(0, "// Welcome to DevDock!\nconsole.log('Hello World');");
                
                yFilesMap.set("src/utils.js", true);
                ydoc.getText("src/utils.js").insert(0, "export const add = (a, b) => a + b;");

                setFileName("index.js");
            }
        } else {
             if (!yFilesMap.has(fileName)) {
                 setFileName(Array.from(yFilesMap.keys())[0]);
             }
        }
        setFiles(Array.from(yFilesMap.keys()));
    };

    yFilesMap.observe(() => {
        setFiles(Array.from(yFilesMap.keys()));
    });
    
    setTimeout(initProject, 500);

    window.currentYDoc = ydoc;
    window.currentProvider = provider;

    return () => {
        provider.destroy();
        ydoc.destroy();
        document.head.removeChild(styleSheet);
    };
  }, [roomId]); 

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

  const handleCreateFile = (name) => {
      if (window.currentYDoc) {
          window.currentYDoc.getMap("project-files").set(name, true);
          setFileName(name);
      }
  };

  const handleDeleteFile = (name) => {
      if (window.currentYDoc) {
          const map = window.currentYDoc.getMap("project-files");
          map.delete(name);
          if (fileName === name) {
              const keys = Array.from(map.keys());
              if (keys.length > 0) setFileName(keys[0]);
              else setFileName("script.js"); 
          }
      }
  };

  const handleRenameFile = (oldName, newName) => {
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
      if (filename.endsWith('.js')) return 'javascript';
      if (filename.endsWith('.py')) return 'python';
      if (filename.endsWith('.java')) return 'java';
      if (filename.endsWith('.c')) return 'c';
      if (filename.endsWith('.cpp')) return 'cpp';
      return 'javascript';
  };

  // Resize Handlers
  const startResizing = (direction) => (e) => {
      isResizing.current = direction;
      document.body.style.cursor = direction === 'terminal' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none'; // Prevent text selection
  };

  const stopResizing = useCallback(() => {
      isResizing.current = null;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
  }, []);

  const onMouseMove = useCallback((e) => {
      if (!isResizing.current) return;

      if (isResizing.current === 'sidebar') {
          const newW = e.clientX;
          if (newW > 150 && newW < 600) setLayout(prev => ({ ...prev, sidebarW: newW }));
      }
      if (isResizing.current === 'chat') {
          const newW = window.innerWidth - e.clientX;
          if (newW > 250 && newW < 600) setLayout(prev => ({ ...prev, chatW: newW }));
      }
      if (isResizing.current === 'terminal') {
          const newH = window.innerHeight - e.clientY;
          if (newH > 100 && newH < window.innerHeight - 100) setLayout(prev => ({ ...prev, terminalH: newH }));
      }
  }, []);

  useEffect(() => {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopResizing);
      return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', stopResizing);
      };
  }, [onMouseMove, stopResizing]);

  const runCode = async () => {
    if (!editorRef) return;
    setIsRunning(true);
    // setOutput(["Running..."]); // REMOVED
    setActiveTab("terminal");
    // setTerminalHistory(prev => [...prev, { type: 'system', content: 'Running...' }]); // Wait for response
    
    // Toast: Started
    const toastId = addToast("Executing code...", "loading", 0);

    const code = editorRef.getValue();
    const lang = getLanguage(fileName);
    
    // Log for debugging
    console.log(`[EXEC] Sending Request: Language=${lang}`); 

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang, stdin: stdin }),
      });

      const data = await response.json();
      
      // Remove loading toast
      removeToast(toastId);

      if (data.run) {
          const lines = data.run.output?.split("\n") || [];
          setTerminalHistory(prev => [...prev, { type: 'system', content: '> Executing code...' }]);
          lines.forEach(line => {
             setTerminalHistory(prev => [...prev, { type: 'output', content: line }]);
          });
          
          addToast("Execution Successful", "success", 2000);
          
      } else {
          setTerminalHistory(prev => [...prev, 
            { type: 'error', content: "Execution failed" },
            { type: 'error', content: data.message || "Unknown error" }
          ]);
          addToast("Execution Failed", "error", 4000);
      }
    } catch (error) {
      removeToast(toastId);
      setTerminalHistory(prev => [...prev, 
        { type: 'error', content: `Error: ${error.message}` },
        { type: 'error', content: "Check server logs for details." }
      ]);
      addToast("Network Error", "error", 4000);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTerminalCommand = (cmd) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      // Add command to history
      setTerminalHistory(prev => [...prev, { type: 'command', content: trimmed, user: user.name }]);

      const [command, ...args] = trimmed.split(' ');

      switch (command) {
          case 'clear':
              setTerminalHistory([]);
              break;
          case 'help':
              setTerminalHistory(prev => [...prev, { type: 'system', content: 'Available commands:\n  ls            List files\n  cat <file>    Read file content\n  run           Run current code\n  clear         Clear terminal\n  whoami        Show current user' }]);
              break;
          case 'ls':
              setTerminalHistory(prev => [...prev, { type: 'output', content: files.join('\n') }]);
              break;
          case 'whoami':
                setTerminalHistory(prev => [...prev, { type: 'output', content: user.name }]);
                break;
          case 'cat':
              if (args.length === 0) {
                  setTerminalHistory(prev => [...prev, { type: 'error', content: 'Usage: cat <filename>' }]);
              } else {
                  const targetFile = args[0];
                  if (window.currentYDoc) {
                      const yFilesMap = window.currentYDoc.getMap("project-files");
                      if (yFilesMap.has(targetFile)) {
                         const content = window.currentYDoc.getText(targetFile).toString();
                         setTerminalHistory(prev => [...prev, { type: 'output', content: content }]);
                      } else {
                          setTerminalHistory(prev => [...prev, { type: 'error', content: `File not found: ${targetFile}` }]);
                      }
                  }
              }
              break;
          case 'run':
              runCode();
              break;
          default:
              setTerminalHistory(prev => [...prev, { type: 'error', content: `Command not found: ${command}` }]);
      }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <IDEHeader 
        roomId={roomId}
        fileName={fileName}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        runCode={runCode}
        isRunning={isRunning}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
      />
      
      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Container (Desktop: Resizable, Mobile: Drawer) */}
        {(!isMobile || showSidebar) && (
            <div 
                style={{ width: isMobile ? '80%' : layout.sidebarW }} 
                className={`flex flex-col shrink-0 ${isMobile ? 'fixed inset-y-0 left-0 z-50 shadow-2xl bg-surface' : ''}`}
            >
                <Sidebar 
                    files={files} 
                    activeFile={fileName} 
                    onSelect={(f) => { setFileName(f); if(isMobile) setShowSidebar(false); }} 
                    onCreate={handleCreateFile} 
                    onDelete={handleDeleteFile}
                    onRename={handleRenameFile}
                />
            </div>
        )}
        
        {/* Mobile Sidebar Backdrop */}
        {isMobile && showSidebar && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSidebar(false)} />
        )}

        {/* Resizer: Sidebar <-> Editor (Desktop Only) */}
        {!isMobile && (
            <div 
                onMouseDown={startResizing('sidebar')}
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
                theme={theme === 'dark' ? "vs-dark" : "light"}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    padding: { top: 20 },
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                }}
                />
            </div>

            {/* Resizer: Editor <-> Terminal */}
            <div 
                onMouseDown={startResizing('terminal')}
                className="h-1 bg-surface hover:bg-blue-500 cursor-row-resize border-y border-border transition-colors z-10"
            />

            {/* Terminal Area */}
            <TerminalPanel 
                height={layout.terminalH}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                history={terminalHistory}           // Changed prop
                onCommand={handleTerminalCommand}   // New prop
                stdin={stdin}
                setStdin={setStdin}
                user={user}
                roomId={roomId}
            />
        </div>

        {/* Chat Resizer (only if open) */}
        {isChatOpen && (
            <div 
                onMouseDown={startResizing('chat')}
                className="w-1 bg-surface hover:bg-blue-500 cursor-col-resize border-l border-border transition-colors z-10"
            />
        )}

        {/* Chat Panel */}
        {/* Chat Panel (Desktop: Resizable, Mobile: Drawer) */}
        {isChatOpen && (
            <>
                <div 
                    style={{ width: isMobile ? '85%' : layout.chatW }} 
                    className={`shrink-0 ${isMobile ? 'fixed inset-y-0 right-0 z-50 shadow-2xl bg-surface border-l border-border' : ''}`}
                >
                    <Chat 
                        ydoc={window.currentYDoc} 
                        provider={window.currentProvider} 
                        username={user.name} 
                        color={user.color} 
                        onClose={() => setIsChatOpen(false)}
                    />
                </div>
                {/* Mobile Chat Backdrop */}
                {isMobile && (
                    <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={() => setIsChatOpen(false)} />
                )}
            </>
        )}

      </div>
      
      {/* Status Bar */}
      <StatusBar 
        fileCount={files.length} 
        username={user.name} 
        fileName={fileName} 
      />
      
    </div>
  );
};

export default IDE;
