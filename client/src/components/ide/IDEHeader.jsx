import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, LayoutGrid, Globe, ChevronRight, MessageSquare, Play, Menu, Share2, LogIn } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";

const IDEHeader = ({ user, roomId='Demo-Room', fileName='Untitled', isChatOpen, setIsChatOpen, runCode, isRunning, onToggleSidebar, isViewMode=false }) => {
    const [isShareOpen, setIsShareOpen] = React.useState(false);
  return (
    <header className="h-[45px] px-4 bg-surface flex justify-between items-center border-b border-border select-none">
        {/* Left: Branding & File Info */}
        <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="md:hidden text-muted hover:text-foreground">
                <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 font-bold text-base tracking-wide text-foreground">
                <Code2 size={18} className="text-blue-500" />
                <span>Hexode</span>
            </div>
            {/* Dashboard Link */}
            <Link to="/dashboard" className="hidden md:flex no-underline text-muted text-xs items-center gap-1.5 bg-card px-2.5 py-1 rounded hover:text-foreground transition-colors border border-border">
                <LayoutGrid size={13} /> Dashboard
            </Link>
            <div className="hidden md:block h-4 w-px bg-border"></div>
            <span className="hidden md:flex text-xs text-muted items-center gap-1.5 font-mono">
                {user?.username} <Globe size={13} /> {roomId} <ChevronRight size={12} /> {fileName}
            </span>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-3 items-center">
            {!isViewMode && (
                <>
                    <div className="relative">
                        <button
                            onClick={() => setIsShareOpen(!isShareOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-transparent text-muted text-xs hover:text-foreground hover:border-zinc-500 transition-all"
                            title="Share Project"
                        >
                            <Share2 size={14} />
                            <span className="hidden md:inline">Share</span>
                        </button>
                        
                        {isShareOpen && (
                            <div className="absolute top-full right-0 mt-1 w-48 bg-surface border border-border shadow-xl rounded-md flex flex-col z-50 overflow-hidden">
                                <button 
                                    onClick={() => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.delete('mode'); // Clear mode for editable
                                        navigator.clipboard.writeText(url.toString());
                                        alert("Editable link copied!");
                                        setIsShareOpen(false);
                                    }}
                                    className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-zinc-800 transition-colors"
                                >
                                    Copy Editable Link
                                </button>
                                <button 
                                    onClick={() => {
                                        const url = new URL(window.location.href);
                                        url.searchParams.set('mode', 'view');
                                        navigator.clipboard.writeText(url.toString());
                                        alert("Read-only link copied!");
                                        setIsShareOpen(false);
                                    }}
                                    className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-zinc-800 transition-colors border-t border-border"
                                >
                                    Copy Read-Only Link
                                </button>
                            </div>
                        )}
                    </div>

                    {isShareOpen && (
                        <div className="fixed inset-0 z-40" onClick={() => setIsShareOpen(false)} />
                    )}
                </>
            )}

                <ThemeToggle />
                
                <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-all ${isChatOpen ? "bg-card border-border text-foreground" : "bg-transparent border-transparent text-muted hover:text-foreground"}`}
                title="Toggle Chat"
                >
                <MessageSquare size={14} />
                <span className="hidden md:inline">{isChatOpen ? "Hide" : "Chat"}</span>
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

                <div className="h-4 w-px bg-border mx-1"></div>
                
                <div className="flex items-center">
                    {/* <UserButton afterSignOutUrl="/" />
                    <SignInButton mode="modal">
                        <button className="hidden md:flex ml-2" />  */}
                        {/* Hidden verify logic, simplified: if signed in UserButton shows, else nothing or we show SignIn icon? 
                           Actually, UserButton handles conditional rendering if mounted. 
                           No, UserButton renders nothing if not signed in. 
                           So we need check. */}
                    {/* </SignInButton> */}
                    
                    {/* Better approach since hooks rule might forbid inside return if using useUser inside component */}
                    <AuthButtons />
                </div>
        </div>
    </header>
  );
};

const AuthButtons = () => {
    const { isSignedIn } = useUser();
    if (isSignedIn) return <UserButton afterSignOutUrl="/" />;
    return (
        <SignInButton mode="modal">
            <button className="text-muted hover:text-foreground transition-colors" title="Sign In">
                <LogIn size={16} />
            </button>
        </SignInButton>
    );
};

export default IDEHeader;
