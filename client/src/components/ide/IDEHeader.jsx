import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, LayoutGrid, Globe, ChevronRight, MessageSquare, Play, Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

const IDEHeader = ({ roomId, fileName, isChatOpen, setIsChatOpen, runCode, isRunning, onToggleSidebar }) => {
  return (
    <header className="h-[45px] px-4 bg-surface flex justify-between items-center border-b border-border select-none">
        {/* Left: Branding & File Info */}
        <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="md:hidden text-muted hover:text-foreground">
                <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 font-bold text-base tracking-wide text-foreground">
                <Code2 size={18} className="text-blue-500" />
                <span>DevDock</span>
            </div>
            {/* Dashboard Link */}
            <Link to="/dashboard" className="hidden md:flex no-underline text-muted text-xs items-center gap-1.5 bg-card px-2.5 py-1 rounded hover:text-foreground transition-colors border border-border">
                <LayoutGrid size={13} /> Dashboard
            </Link>
            <div className="hidden md:block h-4 w-[1px] bg-border"></div>
            <span className="hidden md:flex text-xs text-muted items-center gap-1.5 font-mono">
                <Globe size={13} /> {roomId} <ChevronRight size={12} /> {fileName}
            </span>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-3 items-center">
                <ThemeToggle />
                
                <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-all ${isChatOpen ? "bg-card border-border text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
                title="Toggle Chat"
                >
                <MessageSquare size={14} />
                <span className="hidden md:inline">{isChatOpen ? "Hide Chat" : "Chat"}</span>
                </button>

                <button 
                onClick={runCode}
                disabled={isRunning}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded text-white text-xs font-semibold shadow-sm transition-all
                    ${isRunning 
                        ? "bg-zinc-700 cursor-not-allowed text-zinc-400" 
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                    }
                `}
                >
                {isRunning ? (
                    <>Running...</>
                ) : (
                    <><Play size={14} className="fill-white" /> Run</>
                )}
                </button>
        </div>
    </header>
  );
};

export default IDEHeader;
