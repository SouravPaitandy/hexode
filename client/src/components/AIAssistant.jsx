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
  Lightbulb,
  Bug,
  Zap,
  MessageSquareCode,
  Lock,
  Coffee,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useModal } from "../context/ModalContext";
import { useToast } from "./Toast";
import { useUser, SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

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
  const { confirm } = useModal();
  const { addToast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const quickActionsScrollRef = useRef(null);
  const { isSignedIn, isLoaded } = useUser();

  // AI Usage tracking (Local proxy for Server 20/day limit)
  const MAX_AI_CALLS_PER_DAY = 20;
  const [aiUsage, setAiUsage] = useState({ count: 0, date: new Date().toDateString() });

  useEffect(() => {
    const stored = localStorage.getItem("hexode-ai-usage");
    const today = new Date().toDateString();
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setAiUsage(parsed);
      } else {
        const resetUsage = { count: 0, date: today };
        setAiUsage(resetUsage);
        localStorage.setItem("hexode-ai-usage", JSON.stringify(resetUsage));
      }
    }
  }, []);

  useEffect(() => {
    const container = quickActionsScrollRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft -= e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // const [insertingCode, setInsertingCode] = useState(null); // Track which code block is being inserted (by content hash or index?) - actually index is hard here. Let's use simple boolean state in CodeBlock or passed down.

  const handleInsertCodeWrapper = (code) => {
    if (onInsertCode) {
      onInsertCode(code);
      // We can't easily track which specific block triggered it without an ID, but the button feedback is enough.
    }
  };

  // Quick action templates
  const quickActions = [
    {
      label: "Explain",
      icon: Lightbulb,
      color: "text-amber-400 dark:text-amber-300",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
      hover: "hover:bg-amber-400/20",
      prompt: "Explain this code in detail",
    },
    {
      label: "Find Bugs",
      icon: Bug,
      color: "text-red-400 dark:text-red-300",
      bg: "bg-red-400/10",
      border: "border-red-400/20",
      hover: "hover:bg-red-400/20",
      prompt: "Find potential bugs and issues in this code",
    },
    {
      label: "Optimize",
      icon: Zap,
      color: "text-blue-500 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      hover: "hover:bg-blue-500/20",
      prompt: "Suggest optimizations for this code",
    },
    {
      label: "Comments",
      icon: MessageSquareCode,
      color: "text-emerald-500 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      hover: "hover:bg-emerald-500/20",
      prompt: "Add helpful comments to this code",
    },
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

  if (!isLoaded) {
    return (
      <div className="bg-surface flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-7rem)] justify-center items-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-muted mt-2">Checking session status...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-surface flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-7rem)] relative overflow-hidden justify-center items-center p-6">
        {/* Glowing backdrop blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-sm w-full flex flex-col items-center z-10"
        >
          {/* Animated glowing locked container */}
          <div className="relative mb-6">
            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl"
            />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative w-16 h-16 bg-card border border-border/80 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-950/20 cursor-pointer"
            >
              <Lock className="w-7 h-7 text-blue-500" />
            </motion.div>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2 text-center tracking-tight flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />{" "}
            Unlock HexodeAI
          </h3>
          <p className="text-xs text-muted max-w-[280px] mb-6 text-center leading-relaxed">
            HexodeAI is a powerful context-aware assistant built directly into
            your IDE. Sign in to start chatting, explaining code, and fixing
            bugs.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-2.5 w-full max-w-[320px] mb-8">
            <div className="p-3 rounded-xl bg-card/45 border border-border/40 flex flex-col items-start gap-1 hover:border-border/80 transition-colors">
              <Lightbulb
                className="w-4 h-4 text-amber-400 animate-bounce"
                style={{ animationDuration: "3s" }}
              />
              <span className="text-[11px] font-semibold text-foreground">
                Explain Code
              </span>
              <span className="text-[9px] text-muted text-left">
                Detailed line-by-line breakdown.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-card/45 border border-border/40 flex flex-col items-start gap-1 hover:border-border/80 transition-colors">
              <Bug className="w-4 h-4 text-red-400" />
              <span className="text-[11px] font-semibold text-foreground">
                Fix & Debug
              </span>
              <span className="text-[9px] text-muted text-left">
                Detect syntax errors and runtime issues.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-card/45 border border-border/40 flex flex-col items-start gap-1 hover:border-border/80 transition-colors">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-[11px] font-semibold text-foreground">
                Optimize
              </span>
              <span className="text-[9px] text-muted text-left">
                Refactor algorithms for speed.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-card/45 border border-border/40 flex flex-col items-start gap-1 hover:border-border/80 transition-colors">
              <MessageSquareCode className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-semibold text-foreground">
                Auto-Insert
              </span>
              <span className="text-[9px] text-muted text-left">
                Directly inject AI code into editor.
              </span>
            </div>
          </div>

          {/* Glowing CTA Button */}
          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-[240px] py-2.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer outline-none"
            >
              Sign In to Continue
            </motion.button>
          </SignInButton>

          <p className="text-[10px] text-muted/60 mt-4">
            Completely free to use for all Hexode accounts
          </p>
        </motion.div>
      </div>
    );
  }

  const handleClearHistory = () => {
    confirm({
      title: "Clear History?",
      message: "Clear all chat history for this project?",
      confirmText: "Clear",
      type: "danger",
      onConfirm: () => {
        setMessages([
          {
            role: "assistant",
            content: "👋 Chat history cleared! How can I help you?",
          },
        ]);
        localStorage.removeItem(`ai-chat-${roomId}`);
      },
    });
  };

  const sendQuickAction = (prompt) => {
    setInput(prompt);
    // Auto-send after a brief delay
    // setTimeout(() => {
    //   sendMessage(prompt);
    // }, 100);
  };

  const sendMessage = async (e, customMessage) => {
    const messageToSend = customMessage || input.trim();
    if (!fileName) {
      addToast("Please select a file to chat with AI.", "error");
      return;
    }
    if (!messageToSend || isLoading) return;

    const userMessage = messageToSend;
    setInput("");
    setIsLoading(true);

    if (aiUsage.count >= MAX_AI_CALLS_PER_DAY) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage },
        { 
          role: "assistant", 
          content: "🚫 **Daily Limit Reached (20/20)**\n\nHexode is a free, open-source project. To keep servers running for everyone, we have a daily limit on AI chats.\n\n[☕ Sponsor Hexode](/sponsor) to help us scale and increase limits for everyone!" 
        }
      ]);
      setIsLoading(false);
      return;
    }

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

      // Update AI Usage count successfully
      const newUsage = { count: aiUsage.count + 1, date: new Date().toDateString() };
      setAiUsage(newUsage);
      localStorage.setItem("hexode-ai-usage", JSON.stringify(newUsage));

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
      <div className="p-3 border-b border-border/50 bg-surface/30 flex items-center justify-between gap-2">
        {/* Scrollable Left Part */}
        <div
          ref={quickActionsScrollRef}
          className="flex items-center gap-2 overflow-x-auto border-r border-gray-600 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 pr-2"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                title={action.prompt}
                onClick={() => sendQuickAction(action.prompt)}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition-all shadow-sm border ${action.bg} ${action.border} ${action.hover} ${action.color} font-medium`}
                disabled={isLoading}
              >
                <Icon size={12} /> {action.label}
              </button>
            );
          })}
        </div>

        {/* Fixed Right Part (Usage & Trash Icon) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-surface rounded-full border border-border/50 text-[10px] text-muted font-medium">
            <div className={`w-1.5 h-1.5 rounded-full ${aiUsage.count >= MAX_AI_CALLS_PER_DAY ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            {Math.max(0, MAX_AI_CALLS_PER_DAY - aiUsage.count)} left
          </div>
          <button
            onClick={handleClearHistory}
            className="shrink-0 px-2.5 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full text-red-400 transition-all flex items-center gap-1 hover:-translate-y-0.5 shadow-sm"
            title="Clear chat history"
            disabled={isLoading}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

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
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t border-border bg-surface"
      >
        <div
          className={`flex gap-2.5 items-center rounded-md px-3 py-1 border focus-within:border-blue-500 transition-colors ${
            input !== ""
              ? "border-blue-500 bg-card"
              : "border-border bg-card/50"
          }`}
        >
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
