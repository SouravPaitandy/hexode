import { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import Sidebar from "../components/Sidebar";
import Chat from "../components/Chat";

import { Play, MessageSquare, Code2, Globe, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

const IDE = () => {
  const { roomId } = useParams();
  const [editorRef, setEditorRef] = useState(null);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // File System State
  const [fileName, setFileName] = useState("script.js"); 
  const [files, setFiles] = useState([]); // List of filenames

  // User State
  const [user, setUser] = useState({ name: "Anonymous", color: "#ccc" });

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
    // Use roomId from URL, default to 'monaco-demo' if missing
    const room = roomId || "monaco-demo";
    // Env var or default to localhost:3001 (Unified Port)
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001"; 
    const provider = new WebsocketProvider(WS_URL, room, ydoc);

    // Set User Awareness
    provider.awareness.setLocalStateField("user", { name: randomName, color: randomColor });
    
    // Handle Remote Cursors CSS
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

    // Handle File List Sync
    const yFilesMap = ydoc.getMap("project-files");
    
    // Helper to Initialize Projects
    const initProject = () => {
        if (yFilesMap.size === 0) {
            const DEMO_CODE = {
                "demo-python": { name: "main.py", content: "def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)\n\nprint([fib(i) for i in range(10)])" },
                "demo-java": { name: "Main.java", content: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Java!\");\n    }\n}" },
                "demo-cpp": { name: "main.cpp", content: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from C++!\" << std::endl;\n    return 0;\n}" }
            };

            const room = roomId || "monaco-demo";
            if (DEMO_CODE[room]) {
                const { name, content } = DEMO_CODE[room];
                yFilesMap.set(name, true);
                ydoc.getText(name).insert(0, content);
                setFileName(name);
            } else {
                yFilesMap.set("script.js", true);
                setFileName("script.js");
            }
        } else {
             // Set first file as active if none selected
             if (!yFilesMap.has(fileName)) {
                 setFileName(Array.from(yFilesMap.keys())[0]);
             }
        }
        setFiles(Array.from(yFilesMap.keys()));
    };

    yFilesMap.observe(() => {
        setFiles(Array.from(yFilesMap.keys()));
    });
    
    // Brief delay to ensure sync before deciding (optional, but safer)
    setTimeout(initProject, 500);

    // Attach ydoc to window
    window.currentYDoc = ydoc;
    window.currentProvider = provider;

    return () => {
        provider.destroy();
        ydoc.destroy();
        document.head.removeChild(styleSheet);
    };
  }, [roomId]); // Re-run if roomId changes (though usually component remounts)

  // 2. Bind Editor to CURRENT File (Whenever fileName or editorRef changes)
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
              // Switch to another file if available
              const keys = Array.from(map.keys());
              if (keys.length > 0) setFileName(keys[0]);
              else setFileName("script.js"); // Fallback
          }
      }
  };

  const handleRenameFile = (oldName, newName) => {
      if (window.currentYDoc && oldName !== newName) {
          const map = window.currentYDoc.getMap("project-files");
          const oldContent = window.currentYDoc.getText(oldName).toString();
          
          // Create new file with old content
          map.set(newName, true);
          window.currentYDoc.getText(newName).insert(0, oldContent);
          
          // Delete old
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
      return 'javascript'; // default
  };

  const runCode = async () => {
    if (!editorRef) return;
    setIsRunning(true);
    setOutput([]); 

    const code = editorRef.getValue();
    const lang = getLanguage(fileName);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${BASE_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: lang }),
      });

      const data = await response.json();
      if (data.run) {
          const lines = data.run.output?.split("\n") || [];
          setOutput(lines);
      } else {
          setOutput(["Error: Execution failed", data.message || "Unknown error"]);
      }
    } catch (error) {
      setOutput([`Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", background: "#0f0f12", overflow: "hidden", color: "#dfe1e5" }}>
      {/* Title Bar - VS Code Style */}
      <header style={{ height: "50px", padding: "0 20px", background: "#16161a", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
        
        {/* Left: Branding & File Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "1.1rem" }}>
                <Code2 size={20} color="#007acc" />
                <span>DevDock</span>
            </div>
            {/* Dashboard Link */}
            <Link to="/dashboard" style={{ textDecoration: 'none', color: '#8892b0', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#222', padding: '4px 12px', borderRadius: '4px', border: '1px solid #333' }}>
                <LayoutGrid size={14} /> Dashboard
            </Link>
            <div style={{ height: "20px", width: "1px", background: "#333" }}></div>
            <span style={{ fontSize: "0.9rem", color: "#8892b0", display: "flex", alignItems: "center", gap: "6px" }}>
                <Globe size={14} /> {roomId} / {fileName}
            </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
             <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{ 
                    background: isChatOpen ? "#222" : "transparent", 
                    border: "1px solid #333", 
                    color: isChatOpen ? "#fff" : "#8892b0", 
                    padding: "6px 12px", 
                    borderRadius: "6px", 
                    cursor: "pointer", 
                    fontSize: "0.85rem",
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    transition: "all 0.2s"
                }}
                title="Toggle Chat"
             >
                <MessageSquare size={16} />
                {isChatOpen ? "Hide Chat" : "Chat"}
             </button>

             <button 
                onClick={runCode}
                disabled={isRunning}
                style={{ 
                    padding: "6px 16px", 
                    background: isRunning ? "#333" : "#007acc", 
                    border: "none", 
                    borderRadius: "6px", 
                    color: "white", 
                    cursor: isRunning ? "not-allowed" : "pointer", 
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: isRunning ? "none" : "0 2px 10px rgba(0, 122, 204, 0.3)",
                    transition: "all 0.2s"
                }}
             >
                {isRunning ? (
                    <>Running...</>
                ) : (
                    <><Play size={16} fill="white" /> Run Code</>
                )}
             </button>
        </div>
      </header>
      
      {/* Main Workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        <Sidebar 
            files={files} 
            activeFile={fileName} 
            onSelect={setFileName} 
            onCreate={handleCreateFile} 
            onDelete={handleDeleteFile}
            onRename={handleRenameFile}
        />

        {/* Editor Split */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#1e1e1e" }}>
            {/* Editor */}
            <div style={{ flex: 1, minHeight: "0" }}>
                <Editor
                height="100%"
                defaultLanguage={getLanguage(fileName)}
                language={getLanguage(fileName)} 
                path={fileName}
                defaultValue="// Loading..."
                theme="vs-dark"
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
            {/* Terminal */}
            <div style={{ height: "200px", background: "#0f0f12", borderTop: "1px solid #333", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "8px 20px", background: "#16161a", color: "#8892b0", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>$&gt; Terminal Output</span>
                </div>
                <div style={{ flex: 1, padding: "15px 20px", fontFamily: "'Fira Code', monospace", overflowY: "auto", color: "#e0e0e0", fontSize: "0.9rem" }}>
                    {output.length === 0 && <div style={{color: "#444", fontStyle: "italic"}}>{"> Ready for execution..."}</div>}
                    {output.map((line, i) => <div key={i} style={{ whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{line === "" ? <br/> : <><span style={{color: "#555"}}>{"> "}</span>{line}</>}</div>)}
                </div>
            </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
            <Chat 
                ydoc={window.currentYDoc} 
                provider={window.currentProvider} 
                username={user.name} 
                color={user.color} 
            />
        )}

      </div>
      
      {/* Status Bar */}
      <div style={{ height: "25px", background: "#007acc", color: "white", display: "flex", alignItems: "center", padding: "0 15px", fontSize: "0.75rem", justifyContent: "space-between", fontWeight: "500" }}>
        <div style={{display: "flex", gap: "20px"}}>
            <span style={{display: "flex", alignItems: "center", gap: "5px"}}>🌱 {files.length} Files</span>
            <span style={{display: "flex", alignItems: "center", gap: "5px"}}>👤 {user.name}</span>
        </div>
        <div style={{display: "flex", gap: "20px"}}>
            <span>{fileName.endsWith('py') ? 'Python 3.10' : fileName.endsWith('.java') ? 'Java 15' : fileName.endsWith('.cpp') ? 'C++ 10.2 (g++)' : fileName.endsWith('.js') ? 'JavaScript (Node 18)' : fileName.endsWith('.c') ? 'C 10.2 (gcc)' : 'Unknown'}</span>
            <span>UTF-8</span>
            <span>Connected</span>
        </div>
      </div>
    </div>
  );
}

export default IDE;
