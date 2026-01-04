import React from "react";
// Removed explicit Tab UI for cleaner "Prompt" look

const TerminalPanel = ({
  height,
  activeTab,
  setActiveTab,
  history,
  onCommand,
  stdin,
  setStdin,
  user,
  roomId,
  terminalMode = "COMMAND",
  isPlayground = false,
}) => {
  const bottomRef = React.useRef(null);
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef(null);

  // History Navigation State
  const [historyIndex, setHistoryIndex] = React.useState(-1); // -1 means "new input"
  const [tempInput, setTempInput] = React.useState(""); // Stores current input while traversing history

  // Auto-scroll to bottom on history change
  React.useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // New command added -> reset history index
    setHistoryIndex(-1);
    setTempInput("");
  }, [history]);

  // Focus input on click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (terminalMode === "AWAITING_STDIN") {
      if (e.key === "Enter") {
        onCommand(input);
        setInput("");
      }
      return;
    }

    // Command History Logic (Only in COMMAND mode)
    const commands = history
      .filter((h) => h.type === "command")
      .map((h) => h.content)
      .reverse(); // Newest first

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        if (historyIndex === -1) setTempInput(input); // Save current typing
        setHistoryIndex(newIndex);
        setInput(commands[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (newIndex === -1) {
          setInput(tempInput); // Restore saved typing
        } else {
          setInput(commands[newIndex]);
        }
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
      className="bg-gray-50 dark:bg-neutral-900 flex flex-col font-mono text-sm p-4 overflow-hidden transition-colors duration-200"
      onClick={handleContainerClick}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {/* Welcome / System Info Header */}
        {/* Welcome / System Info Header */}
        {isPlayground ? (
          <div className="text-blue-500 dark:text-blue-400 mb-2 select-none">
            <span className="font-bold">✨ Hexode Playground Environment</span>
            <br />
            <span className="text-zinc-500 dark:text-zinc-500 text-xs">
              Ephemeral scratchpad. Changes vanish on reload. Type 'help'.
            </span>
          </div>
        ) : (
          <div className="text-zinc-500 dark:text-zinc-500 mb-2 select-none">
            Hexode Simulated Terminal [v2.1]
            <br />
            Type 'help' for available commands.
          </div>
        )}

        {/* History Render */}
        {history.map((entry, i) => (
          <div key={i} className="leading-relaxed wrap-break-word mb-1">
            {entry.type === "command" && (
              <div className="flex items-center gap-2">
                <span className="text-green-600 dark:text-green-500 font-bold">
                  ➜
                </span>
                <span className="text-blue-500 dark:text-blue-400 font-bold">
                  ~
                </span>
                <span className="text-zinc-800 dark:text-zinc-100 font-semibold">
                  $ {entry.content}
                </span>
              </div>
            )}
            {entry.type === "output" && (
              <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap ml-6 border-l-2 border-zinc-200 dark:border-zinc-700 pl-2">
                {entry.content}
              </div>
            )}
            {entry.type === "error" && (
              <div className="text-red-500 dark:text-red-400 ml-6 whitespace-pre-wrap">
                {entry.content}
              </div>
            )}
            {entry.type === "system" && (
              <div className="text-zinc-400 dark:text-zinc-500 italic ml-6">
                # {entry.content}
              </div>
            )}
          </div>
        ))}

        {/* Active Input Line */}
        <div className="flex items-center gap-2 mt-1">
          {terminalMode === "AWAITING_STDIN" ? (
            <>
              <span className="text-orange-500 font-bold">?</span>
              <div className="flex-1 flex items-center">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-orange-600 dark:text-orange-200 placeholder-zinc-400 dark:placeholder-zinc-700 font-medium"
                  placeholder="Enter input for program..."
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </>
          ) : (
            <>
              <span className="text-green-600 dark:text-green-500 font-bold">
                ➜
              </span>
              <span className="text-blue-500 dark:text-blue-400 font-bold">
                ~
              </span>
              <div className="flex-1 flex items-center">
                <span className="text-zinc-400 dark:text-zinc-500 mr-2">$</span>
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-700 font-medium"
                  placeholder="Type a command..."
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </>
          )}
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalPanel;
