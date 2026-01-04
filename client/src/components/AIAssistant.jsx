import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  Sparkles,
  Loader2,
  Send,
  Trash2,
  Download,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const CodeBlock = ({ language, children, onInsert, inserted }) => {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-4 border border-border bg-surface">
      <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
        <span className="text-xs dark:text-muted text-muted-foreground font-mono uppercase">
          {language || "text"}
        </span>
        <div className="flex items-center gap-2">
          {onInsert && (
            <button
              onClick={() => onInsert(String(children))} // Pass content to insert handler
              className="p-1 cursor-pointer dark:hover:bg-surface rounded transition-colors dark:text-blue-400 dark:hover:text-blue-300 text-blue-700 hover:text-blue-900 flex items-center gap-1"
              title="Insert code at cursor"
            >
              {inserted ? <Check size={14} /> : <Download size={14} />}
              <span className="text-xs">
                {inserted ? "Inserted" : "Insert"}
              </span>
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1 cursor-pointer hover:bg-surface rounded transition-colors text-muted hover:text-foreground"
            title="Copy code"
          >
            {copied ? (
              <Check size={14} className="dark:text-green-500 text-green-700" />
            ) : (
              <Copy
                size={14}
                className="dark:text-muted text-muted-foreground"
              />
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={theme === "dark" ? vscDarkPlus : vs} // Default to dark theme style for now since app is dark-ish or variable
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent", // Let container bg handle it
          fontSize: "0.80rem",
        }}
        wrapLines={true}
        wrapLongLines={true}
        PreTag="div"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const AIAssistant = ({ roomId, fileName, onInsertCode }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const [insertingCode, setInsertingCode] = useState(null); // Track which code block is being inserted (by content hash or index?) - actually index is hard here. Let's use simple boolean state in CodeBlock or passed down.
  // Actually, we can just use a temporary state here for animation if needed, or let CodeBlock handle its own inserted state if unique enough.
  // But onInsertCode is passed from parent.

  const handleInsertCodeWrapper = (code) => {
    if (onInsertCode) {
      onInsertCode(code);
      // We can't easily track which specific block triggered it without an ID, but the button feedback is enough.
    }
  };

  // Quick action templates
  const quickActions = [
    { label: "💡 Explain", prompt: "Explain this code in detail" },
    {
      label: "🐛 Find Bugs",
      prompt: "Find potential bugs and issues in this code",
    },
    { label: "⚡ Optimize", prompt: "Suggest optimizations for this code" },
    { label: "📝 Add Comments", prompt: "Add helpful comments to this code" },
  ];

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      // Only auto-scroll if user is already near the bottom
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
    }
  };

  useEffect(() => {
    // Only scroll when a new message is added, not during streaming updates
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`ai-chat-${roomId}`);
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setMessages([
          {
            role: "assistant",
            content:
              "👋 Hi! I'm HexodeAI, your AI coding assistant. Ask me to explain code, find bugs, generate functions, or refactor your code!",
          },
        ]);
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hi! I'm HexodeAI, your AI coding assistant. Ask me to explain code, find bugs, generate functions, or refactor your code!",
        },
      ]);
    }
  }, [roomId]);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`ai-chat-${roomId}`, JSON.stringify(messages));
    }
  }, [messages, roomId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleClearHistory = () => {
    if (confirm("Clear all chat history for this project?")) {
      setMessages([
        {
          role: "assistant",
          content: "👋 Chat history cleared! How can I help you?",
        },
      ]);
      localStorage.removeItem(`ai-chat-${roomId}`);
    }
  };

  const sendQuickAction = (prompt) => {
    setInput(prompt);
    // Auto-send after a brief delay
    setTimeout(() => {
      sendMessage(prompt);
    }, 100);
  };

  const sendMessage = async (customMessage) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = messageToSend;
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Add placeholder for AI response
    const aiMessageIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", streaming: true },
    ]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          message: userMessage,
          fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "AI request failed");
      }

      // Handle Server-Sent Events (SSE) streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.substring(6));

            if (data.done) {
              // Streaming complete
              setMessages((prev) => {
                const updated = [...prev];
                updated[aiMessageIndex] = {
                  role: "assistant",
                  content: accumulatedText,
                  streaming: false,
                };
                return updated;
              });
            } else if (data.text) {
              accumulatedText += data.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[aiMessageIndex] = {
                  role: "assistant",
                  content: accumulatedText,
                  streaming: true,
                };
                return updated;
              });
            } else if (data.error) {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error("[AI] Error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[aiMessageIndex] = {
          role: "assistant",
          content: `❌ Error: ${error.message}`,
          streaming: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-surface flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-7rem)]">
      {/* Quick Actions */}
      {/* <div className="p-4 border-b border-border flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => sendQuickAction(action.prompt)}
            className="px-3 py-1 text-xs bg-card hover:bg-card-hover rounded-full text-muted transition-colors flex items-center gap-1"
            disabled={isLoading}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={handleClearHistory}
          className="ml-auto px-3 py-1 text-xs bg-card hover:bg-card-hover rounded-full text-red-400 transition-colors flex items-center gap-1"
          title="Clear chat history"
          disabled={isLoading}
        >
          <Trash2 size={12} /> Clear
        </button>
      </div> */}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
        style={{ minHeight: "200px" }}
      >
        {messages.map((msg, index) => (
          <div
            key={msg.id ? msg.id : index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                msg.role === "user"
                  ? "bg-blue-600 text-white max-w-[85%] rounded-lg p-3"
                  : "bg-transparent text-foreground max-w-[95%] w-full"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={12} className="text-blue-500" />
                  <span className="text-xs font-bold text-blue-500">
                    HexodeAI
                  </span>
                </div>
              )}
              <div className="text-sm ai-response-content">
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {msg.content}
                  </div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const savedCode = String(children).replace(/\n$/, "");

                        return !inline && match ? (
                          <CodeBlock
                            language={match[1]}
                            onInsert={() => handleInsertCodeWrapper(savedCode)}
                            inserted={false} // Would need state tracking if we want per-block 'Inserted!' state persistence
                          >
                            {savedCode}
                          </CodeBlock>
                        ) : (
                          <code
                            className={`${className} bg-card inline px-1 py-0.5 rounded text-xs font-mono text-blue-700 dark:text-blue-400 font-semibold`}
                            style={inline ? { display: "inline" } : {}}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      h1: ({ children }) => (
                        <h1 className="text-lg font-bold mt-3 mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold mt-3 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold mt-2 mb-1">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside my-2 space-y-1 ml-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside my-2 space-y-1 ml-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm">{children}</li>
                      ),
                      p: ({ children }) => (
                        <div className="my-2 leading-relaxed">{children}</div>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-3 my-2 italic text-muted">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-border">
                          <table className="w-full text-sm text-left">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-card border-b border-border">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">
                          {children}
                        </tbody>
                      ),
                      tr: ({ children }) => (
                        <tr className="hover:bg-card transition-colors">
                          {children}
                        </tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-4 py-2 font-medium text-muted">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2 text-foreground">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                )}
                {msg.streaming && (
                  <span className="inline-block ml-1 animate-pulse">...</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-border bg-surface"
      >
        <div className="flex gap-2.5 items-center bg-card rounded-md px-3 py-1 border border-border focus-within:border-blue-500 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI anything..."
            className="flex-1 bg-transparent border-none text-foreground outline-none text-xs h-8 placeholder-muted/50 resize-none py-2"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-1.5 rounded flex items-center transition-colors ${
              input.trim() && !isLoading
                ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-500"
                : "bg-transparent text-muted cursor-default"
            }`}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
        <p className="text-xs text-muted mt-2 text-center">
          Press Enter to send • Shift+Enter for new line • Powered by Gemini
        </p>
      </form>
    </div>
  );
};

export default AIAssistant;
