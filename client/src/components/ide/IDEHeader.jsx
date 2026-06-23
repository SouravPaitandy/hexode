import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Globe,
  ChevronRight,
  MessageSquare,
  Play,
  Menu,
  Share2,
  LogIn,
  WifiOff,
  Palette,
  Check,
  PanelLeft,
  PanelLeftClose,
  Maximize,
  Minimize,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import { useToast } from "../Toast";
import { THEME_METADATA } from "../../utils/monacoThemes";

const IDEHeader = ({
  user,
  roomId = "Demo-Room",
  projectName,
  fileName,
  isChatOpen,
  setIsChatOpen,
  runCode,
  isRunning,
  showSidebar,
  onToggleSidebar,
  isViewMode = false,
  isSaving = false,
  lastSaved,
  isConnected = true,
  isOwner = true,
  isGuestEditAllowed = false,
  onToggleGuestAccess,
  isPlayground = false,
  editorTheme,
  onThemeChange,
  isFullscreen,
  toggleFullscreen,
}) => {
  const [isShareOpen, setIsShareOpen] = React.useState(false);
  const [isThemeOpen, setIsThemeOpen] = React.useState(false);
  const { addToast } = useToast();

  const darkThemes = THEME_METADATA.filter((t) => t.dark && !t.builtin);
  const lightThemes = THEME_METADATA.filter((t) => !t.dark && !t.builtin);
  const classicThemes = THEME_METADATA.filter((t) => t.builtin);
  const activeThemeMeta = THEME_METADATA.find((t) => t.id === editorTheme);

  return (
    <header className="h-[45px] px-4 glass-panel border-x-0 border-t-0 flex justify-between items-center z-40 select-none">
      {/* Left: Branding & File Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
        <button
          onClick={onToggleSidebar}
          className="text-muted hover:text-foreground transition-colors cursor-pointer"
          title={showSidebar ? "Close Sidebar (Ctrl+B)" : "Open Sidebar (Ctrl+B)"}
        >
          {showSidebar ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
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
        <div className="hidden md:flex text-xs text-muted items-center gap-1.5 font-mono min-w-0">
          <span
            className="truncate max-w-[80px] lg:max-w-[100px]"
            title={user?.username}
          >
            {user?.username}
          </span>
          <Globe size={13} className="shrink-0" />
          <span className="truncate max-w-[100px]" title={projectName}>
            {projectName}
          </span>
          {fileName && (
            <>
              <ChevronRight size={12} className="shrink-0" />
              <span
                className="truncate max-w-[150px] lg:max-w-[200px] text-foreground"
                title={fileName}
              >
                {fileName}
              </span>
            </>
          )}
        </div>
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
        {isPlayground
          ? null
          : !isViewMode && (
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
                                isGuestEditAllowed
                                  ? "bg-green-500"
                                  : "bg-zinc-600"
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
                          url.searchParams.delete("mode");
                          navigator.clipboard.writeText(url.toString());
                          addToast("Project link copied!", "success", 2000);
                          setIsShareOpen(false);
                        }}
                        className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-card transition-colors"
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
                        className="text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-card transition-colors border-t border-border"
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

        {/* ── Theme Picker ─────────────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => setIsThemeOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-transparent text-muted text-xs hover:text-foreground hover:border-zinc-500 transition-all"
            title="Editor Theme"
          >
            {/* Swatch dot showing current theme color */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
              style={{ backgroundColor: activeThemeMeta?.color ?? "#82AAFF" }}
            />
            <Palette size={13} />
            <span className="hidden md:inline max-w-[80px] truncate">
              {activeThemeMeta?.label ?? "Theme"}
            </span>
          </button>

          {isThemeOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-surface border border-border shadow-2xl rounded-xl z-50 overflow-hidden">
              {/* Dark Themes */}
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] font-bold tracking-widest text-muted uppercase">
                  Dark
                </p>
              </div>
              {darkThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                    editorTheme === t.id
                      ? "bg-card text-foreground"
                      : "text-muted hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="flex-1 font-medium">{t.label}</span>
                  <span className="text-[10px] text-muted/60 hidden md:block truncate">
                    {t.description}
                  </span>
                  {editorTheme === t.id && (
                    <Check size={12} className="text-blue-400 shrink-0" />
                  )}
                </button>
              ))}

              {/* Light Themes */}
              <div className="px-3 pt-2.5 pb-1 border-t border-border mt-1">
                <p className="text-[10px] font-bold tracking-widest text-muted uppercase">
                  Light
                </p>
              </div>
              {lightThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                    editorTheme === t.id
                      ? "bg-card text-foreground"
                      : "text-muted hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="flex-1 font-medium">{t.label}</span>
                  <span className="text-[10px] text-muted/60 hidden md:block truncate">
                    {t.description}
                  </span>
                  {editorTheme === t.id && (
                    <Check size={12} className="text-blue-500 shrink-0" />
                  )}
                </button>
              ))}

              <div className="px-3 pt-2.5 pb-1 border-t border-border mt-1">
                <p className="text-[10px] font-bold tracking-widest text-muted uppercase">
                  Classic
                </p>
              </div>
              {classicThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left ${
                    editorTheme === t.id
                      ? "bg-card text-foreground"
                      : "text-muted hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="flex-1 font-medium">{t.label}</span>
                  <span className="text-[10px] text-muted/60 hidden md:block truncate">
                    {t.description}
                  </span>
                  {editorTheme === t.id && (
                    <Check size={12} className="text-blue-500 shrink-0" />
                  )}
                </button>
              ))}

              <div className="px-3 py-2 border-t border-border mt-1">
                <p className="text-[10px] text-muted/50 text-center">
                  Preference saved automatically
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Backdrop to close theme picker on outside click */}
        {isThemeOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsThemeOpen(false)}
          />
        )}
        {/* ─────────────────────────────────────────────────────────────── */}

        <ThemeToggle />

        {!isPlayground && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs border-border transition-all ${
              isChatOpen
                ? "bg-card text-foreground"
                : "bg-transparent text-muted hover:text-foreground"
            }`}
            title="Toggle Chat (Ctrl+M)"
          >
            <MessageSquare size={14} />
            <span className="hidden md:inline">
              {isChatOpen ? "Hide" : "Chat"}
            </span>
          </button>
        )}

        {/* ── Fullscreen Toggle ── */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-transparent bg-transparent text-muted text-xs hover:bg-card hover:text-foreground hover:border-border transition-all"
          title="Fullscreen (F11)"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>

        <button
          onClick={runCode}
          disabled={!fileName || isRunning}
          title={!fileName ? "Select a file to run" : "Run Code (Ctrl+Enter)"}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-md text-white text-sm font-bold shadow-lg ring-1 transition-all
                    ${
                      isRunning || !fileName
                        ? "bg-zinc-700 cursor-not-allowed text-zinc-400 shadow-none ring-transparent"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30 ring-blue-400/20"
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
