import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, TerminalSquare } from "lucide-react";

/**
 * StdinModal
 * A floating pre-execution panel where users can type their full stdin
 * (multi-line) before running code. Each line becomes one `input()` /
 * `Scanner.nextLine()` / `scanf` call in the program.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - () => void
 *   onRun       - (stdinString: string) => void
 *   language    - string (for placeholder hint)
 */
const StdinModal = ({ isOpen, onClose, onRun, language = "javascript" }) => {
  const [stdinValue, setStdinValue] = React.useState("");
  const textareaRef = useRef(null);

  // Auto-focus textarea when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    } else {
      setStdinValue(""); // clear on close
    }
  }, [isOpen]);

  const handleRun = () => {
    onRun(stdinValue);
    onClose();
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter / Cmd+Enter → run immediately
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
    // Escape → close without running
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Language-specific placeholder hints
  const PLACEHOLDERS = {
    python:
      "# Each line = one input() call\n# Example:\n5\n1 2 3 4 5",
    java:
      "// Each line = one Scanner.nextLine() / nextInt() call\n// Example:\n3\nhello world\n42",
    c:
      "// Each line = one scanf() call\n// Example:\n10\n2 3",
    cpp:
      "// Each line = one cin >> call\n// Example:\n10\n2 3",
    javascript:
      "// Node.js: each line feeds readline()\n// Example:\n5\n1 2 3 4 5",
  };

  const placeholder = PLACEHOLDERS[language] || PLACEHOLDERS.javascript;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed z-50 bottom-1/3 left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                  <TerminalSquare size={15} className="text-blue-400" />
                  Standard Input (stdin)
                </div>
                <button
                  onClick={onClose}
                  className="text-white/30 hover:text-white/70 transition-colors"
                  title="Close (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Hint */}
              <div className="px-4 pt-3 pb-1 text-xs text-white/50 font-mono leading-relaxed">
                Each line = one input prompt. Leave blank to run with no input.
              </div>

              {/* Textarea */}
              <div className="px-4 pb-3">
                <textarea
                  ref={textareaRef}
                  value={stdinValue}
                  onChange={(e) => setStdinValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={6}
                  spellCheck={false}
                  className="w-full bg-black/60 border border-white/16 rounded-lg px-3 py-2.5 text-sm text-green-300 font-mono placeholder-white/30 outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/2">
                <span className="text-[11px] text-white/30 font-mono">
                  Ctrl+Enter to run · Esc to cancel
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
                  >
                    <Play size={12} className="fill-white" />
                    Run Code
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default StdinModal;
