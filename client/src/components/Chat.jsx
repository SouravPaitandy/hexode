import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';

const Chat = ({ provider, ydoc, username, color, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ydoc) return;
    const yMessages = ydoc.getArray('chat-messages');
    setMessages(yMessages.toArray());
    yMessages.observe(() => {
        setMessages(yMessages.toArray());
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
  }, [ydoc]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const yMessages = ydoc.getArray('chat-messages');
    const msg = {
        id: Date.now(),
        user: username,
        color: color,
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    yMessages.push([msg]);
    setInput("");
  };

  return (
    <div className="w-full h-full bg-surface border-l border-border flex flex-col text-foreground">
      <div className="h-[45px] px-4 bg-surface text-muted text-xs font-bold uppercase tracking-widest border-b border-border flex items-center justify-between select-none">
        <span className="flex items-center gap-2"><MessageSquare size={14} /> LIVE CHAT</span>
        <button onClick={onClose} className="bg-transparent border-none text-muted cursor-pointer hover:text-foreground transition-colors"><X size={16} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => (
            <div key={msg.id} className="flex flex-col items-start animate-[fadeIn_0.2s]">
                <div className="flex items-baseline gap-2 mb-0.5">
                    <span style={{ color: msg.color }} className="text-xs font-bold">{msg.user}</span>
                    <span className="text-muted text-[10px] opacity-80">{msg.time}</span>
                </div>
                <div className="text-foreground text-sm leading-snug wrap-break-word">
                    {msg.text}
                </div>
            </div>
        ))}
        {messages.length === 0 && <div className="text-center text-muted mt-5 text-sm">Welcome to Hexode Chat!<br/> No messages yet.<br/>Say hello! 👋</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-border bg-surface">
        <div className="flex gap-2.5 items-center bg-card rounded-md px-3 py-1 border border-border focus-within:border-blue-500 transition-colors">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none text-foreground outline-none text-xs h-8 placeholder-muted/50"
            />
            <button 
                type="submit" 
                disabled={!input.trim()}
                className={`p-1.5 rounded flex items-center transition-colors ${input.trim() ? "bg-blue-600 text-white cursor-pointer hover:bg-blue-500" : "bg-transparent text-muted cursor-default"}`}
            >
                <Send size={14} />
            </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
