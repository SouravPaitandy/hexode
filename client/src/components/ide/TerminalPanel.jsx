import React from "react";

const TerminalPanel = ({
  height,
  history,
  onCommand,
  stdin,
  setStdin,
  user,
  roomId,
  isPlayground = false,
}) => {
  const bottomRef = React.useRef(null);
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef(null);

  // History navigation state
  const [historyIndex, setHistoryIndex] = React.useState(-1);
  const [tempInput, setTempInput] = React.useState("");

  // Auto-scroll to bottom on new history entries
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setHistoryIndex(-1);
    setTempInput("");
  }, [history]);

  // Focus input when user clicks anywhere in the terminal
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const commands = history
      .filter((h) => h.type === "command")
      .map((h) => h.content)
      .reverse(); // Newest first for ArrowUp

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        if (historyIndex === -1) setTempInput(input); // save current draft
        setHistoryIndex(newIndex);
        setInput(commands[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? tempInput : commands[newIndex]);
      }
    } else if (e.key === "Enter") {
      onCommand(input);
      setInput("");
      setHistoryIndex(-1);
      setTempInput("");
    }
  };

  return (
    <div
      style={{ height }}
      className="bg-zinc-900 dark:bg-[#000000] border-t border-zinc-200 dark:border-white/5 flex flex-col font-mono text-sm p-4 overflow-hidden shadow-inner dark:shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] transition-colors"
      onClick={handleContainerClick}
    >
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Welcome Header */}
        {isPlayground ? (
          <div className="text-blue-400 mb-2 select-none">
            <span className="font-bold">✨ Hexode Playground Environment</span>
            <br />
            <span className="text-zinc-500 text-xs">
              Ephemeral scratchpad. Changes vanish on reload. Type 'help'.
            </span>
          </div>
        ) : (
          <div className="text-zinc-500 mb-2 select-none">
            Hexode Terminal [v2.5] — Type 'help' for commands. Use Run{" "}
            <span className="text-zinc-400">▶</span> to execute with stdin.
          </div>
        )}

        {/* History Render */}
        {history.map((entry, i) => (
          <div key={i} className="leading-relaxed wrap-break-word mb-1">
            {entry.type === "command" && (
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-bold">➜</span>
                <span className="text-blue-400 font-bold">~</span>
                <span className="text-zinc-100 font-semibold">
                  $ {entry.content}
                </span>
              </div>
            )}
            {entry.type === "output" && (
              <div className="text-zinc-300 whitespace-pre-wrap ml-6 border-l-2 border-zinc-800 pl-2">
                {entry.content}
              </div>
            )}
            {entry.type === "error" && (
              <div className="text-red-400 ml-6 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}
            {entry.type === "system" && (
              <div className="text-zinc-500 italic ml-6"># {entry.content}</div>
            )}
          </div>
        ))}

        {/* Active Command Input */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-green-500 font-bold">➜</span>
          <span className="text-blue-400 font-bold">~</span>
          <div className="flex-1 flex items-center">
            <span className="text-zinc-500 mr-2">$</span>
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-600 font-medium"
              placeholder="Type a command... (run, ls, clear, help)"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
