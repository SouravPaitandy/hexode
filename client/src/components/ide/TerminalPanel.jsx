import React from 'react';
import { Terminal, Keyboard, AlertCircle, CheckCircle2 } from 'lucide-react';

const TerminalPanel = ({ height, activeTab, setActiveTab, history, onCommand, stdin, setStdin, user, roomId }) => {
  const bottomRef = React.useRef(null);
  const [input, setInput] = React.useState("");

  React.useEffect(() => {
      if (activeTab === 'terminal' && bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [history, activeTab]);

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
          onCommand(input);
          setInput("");
      }
  };

  return (
    <div style={{ height }} className="bg-surface flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-border">
            <button 
                onClick={() => setActiveTab("terminal")}
                className={`px-4 py-2 text-xs font-medium border-t-2 flex items-center gap-1.5 cursor-pointer select-none transition-colors
                    ${activeTab === "terminal" ? "bg-card border-blue-500 text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
            >
                <Terminal size={12} /> TERMINAL
            </button>
            <button 
                onClick={() => setActiveTab("input")}
                className={`px-4 py-2 text-xs font-medium border-t-2 flex items-center gap-1.5 cursor-pointer select-none transition-colors
                    ${activeTab === "input" ? "bg-card border-blue-500 text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
            >
                <Keyboard size={12} /> STDIN {stdin.length > 0 && <span className="text-[10px] dark:bg-zinc-700 bg-zinc-200 px-1 rounded ml-1 text-foreground">{stdin.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab("console")}
                className={`px-4 py-2 text-xs font-medium border-t-2 flex items-center gap-1.5 cursor-pointer select-none transition-colors
                    ${activeTab === "console" ? "bg-card border-blue-500 text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
            >
                    CONSOLE
            </button>
            <button 
                onClick={() => setActiveTab("problems")}
                className={`px-4 py-2 text-xs font-medium border-t-2 flex items-center gap-1.5 cursor-pointer select-none transition-colors
                    ${activeTab === "problems" ? "bg-card border-blue-500 text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
            >
                    <AlertCircle size={12} /> PROBLEMS <span className="bg-blue-600 dark:text-foreground text-gray-100 px-1 rounded text-[10px]">0</span>
            </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto font-mono text-sm p-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            {activeTab === "terminal" && (
                <div className="flex flex-col min-h-full">
                    <div className="flex-1 space-y-1">
                        {history.map((entry, i) => (
                            <div key={i} className="leading-relaxed wrap-break-word">
                                {entry.type === 'command' && (
                                    <div className="text-zinc-400 font-bold mt-2">
                                        <span className="text-green-500">➜</span> <span className="text-blue-400">~</span> <span className="text-foreground">$ {entry.content}</span>
                                    </div>
                                )}
                                {entry.type === 'output' && (
                                    <div className="text-foreground whitespace-pre-wrap ml-4 border-l-2 border-border pl-2">{entry.content}</div>
                                )}
                                {entry.type === 'error' && (
                                    <div className="text-red-400 ml-4">{entry.content}</div>
                                )}
                                {entry.type === 'system' && (
                                    <div className="text-muted italic ml-4">{entry.content}</div>
                                )}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                    
                    {/* Input Line */}
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                        <span className="dark:text-green-500 text-green-700">➜</span>
                        <span className="dark:text-blue-400 text-blue-600">~</span>
                        <input 
                            autoFocus
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none dark:text-zinc-200 text-black dark:placeholder-zinc-600 placeholder-zinc-700"
                            placeholder="Type a command (ls, cat, run, help)..."
                        />
                    </div>
                </div>
            )}
            {activeTab === "input" && (
                <div className="flex flex-col h-full">
                    <div className="text-xs text-muted mb-2">Provide standard input (stdin) for your program here:</div>
                    <textarea 
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                        placeholder="Enter input values here..."
                        className="flex-1 dark:bg-zinc-900 bg-gray-200 border border-border text-black dark:text-zinc-200 p-2 rounded outline-none font-mono text-sm resize-none focus:border-blue-500"
                    />
                </div>
            )}
            {activeTab === "console" && (
                <div className="dark:text-zinc-400 text-zinc-800 text-xs">
                        <div>[System] Connected to DevDock Server v1.0</div>
                        <div>[System] Session ID: {Math.floor(Math.random() * 999999)}</div>
                        <div>[Collab] User '{user?.name || "Guest"}' joined room '{roomId}'</div>
                </div>
            )}
            {activeTab === "problems" && (
                <div className="text-muted text-sm flex items-center gap-2 justify-center h-full">
                        <CheckCircle2 size={32} className="dark:text-green-500 text-green-700" />
                        <span>No problems detected in workspace.</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default TerminalPanel;
