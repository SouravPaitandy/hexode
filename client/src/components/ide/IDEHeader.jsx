import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  LayoutGrid,
  Globe,
  ChevronRight,
  MessageSquare,
  Play,
  Menu,
  Share2,
  LogIn,
  WifiOff,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import { useToast } from "../Toast";

const IDEHeader = ({
  user,
  roomId = "Demo-Room",
  fileName = "Untitled",
  isChatOpen,
  setIsChatOpen,
  runCode,
  isRunning,
  onToggleSidebar,
  isViewMode = false,
  isSaving = false,
  lastSaved,
  isConnected = true,
  isOwner = true,
  isGuestEditAllowed = false,
  onToggleGuestAccess,
  isPlayground = false,
}) => {
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const { addToast } = useToast();
  return (
    <header className="h-[45px] px-4 bg-surface flex justify-between items-center border-b border-border select-none">
      {/* Left: Branding & File Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-muted hover:text-foreground"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 font-bold text-base tracking-wide text-foreground">
          <img src="../../logo.png" alt="</>" className="w-5 h-5" />
          <span>Hexode</span>
        </div>
        {/* Dashboard Link */}
        <Link
          to="/dashboard"
          className="hidden md:flex no-underline text-muted text-xs items-center gap-1.5 bg-card px-2.5 py-1 rounded hover:text-foreground transition-colors border border-border"
        >
          <LayoutGrid size={13} /> Dashboard
        </Link>
        <div className="hidden md:block h-4 w-px bg-border"></div>
        <span className="hidden md:flex text-xs text-muted items-center gap-1.5 font-mono">
          {user?.username} <Globe size={13} /> {roomId}{" "}
          <ChevronRight size={12} /> {fileName}
        </span>
        <div className="h-4 w-px bg-border"></div>

        {/* Connection & Save Status */}
        {isPlayground ? null : !isConnected ? (
          <span className="text-xs text-red-500 flex items-center gap-1 font-medium bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <WifiOff size={11} /> Offline
          </span>
        ) : isSaving ? (
          <span className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">
            Saving...
          </span>
        ) : lastSaved ? (
          <span className="text-xs text-green-500/80 flex items-center gap-1">
            Saved
          </span>
        ) : null}
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
                <div className="absolute top-full right-0 mt-1 w-56 bg-surface border border-border shadow-xl rounded-md flex flex-col z-50 overflow-hidden">
                  {/* Access Control (Owner Only) */}
                  {isOwner && (
                    <div className="px-3 py-2 border-b border-border bg-card/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">
                          Guest Access
                        </span>
                        <button
                          onClick={onToggleGuestAccess}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                            isGuestEditAllowed ? "bg-green-500" : "bg-zinc-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              isGuestEditAllowed
                                ? "translate-x-4"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted mt-1 leading-tight">
                        {isGuestEditAllowed
                          ? "Anyone with the link can edit."
                          : "Only you can edit."}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("mode"); // Clear mode for editable
                      navigator.clipboard.writeText(url.toString());
                      addToast("Project link copied!", "success", 2000);
                      setIsShareOpen(false);
                    }}
                    className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-zinc-800 transition-colors"
                  >
                    Copy Project Link
                  </button>
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set("mode", "view");
                      navigator.clipboard.writeText(url.toString());
                      addToast("Read-only link copied!", "success", 2000);
                      setIsShareOpen(false);
                    }}
                    className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-zinc-800 transition-colors border-t border-border"
                  >
                    Copy Read-Only Link (Explicit)
                  </button>
                </div>
              )}
            </div>

            {isShareOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsShareOpen(false)}
              />
            )}
          </>
        )}

        <ThemeToggle />

        {!isPlayground && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs border-border transition-all ${
              isChatOpen
                ? "bg-card text-foreground"
                : "bg-transparent text-muted hover:text-foreground"
            }`}
            title="Toggle Chat"
          >
            <MessageSquare size={14} />
            <span className="hidden md:inline">
              {isChatOpen ? "Hide" : "Chat"}
            </span>
          </button>
        )}

        <button
          onClick={runCode}
          disabled={isRunning}
          title="Run Code"
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded text-white text-xs font-semibold shadow-sm transition-all
                    ${
                      isRunning
                        ? "bg-zinc-700 cursor-not-allowed text-zinc-400"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                    }
                `}
        >
          {isRunning ? (
            <>
              <span className="hidden md:inline">Running...</span>
              <span className="md:hidden">...</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-white" />
              <span className="hidden md:inline">Run</span>
            </>
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
      <button
        className="text-muted hover:text-foreground transition-colors"
        title="Sign In"
      >
        <LogIn size={16} />
      </button>
    </SignInButton>
  );
};

export default IDEHeader;
