import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const Chat = ({ provider, ydoc, username, color }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!ydoc) return;
    
    // Sync with Y.Array
    const yMessages = ydoc.getArray('chat-messages');
    
    // Initial Load
    setMessages(yMessages.toArray());

    // Listen for updates
    yMessages.observe(() => {
        setMessages(yMessages.toArray());
        // Scroll to bottom
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
    <div style={{ width: "350px", flexShrink: 0, background: "#16161a", borderLeft: "1px solid #222", display: "flex", flexDirection: "column", height: "100%", color: "#dfe1e5" }}>
      <div style={{ padding: "15px", background: "#16161a", color: "#8892b0", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: "8px" }}>
        <MessageSquare size={16} /> Dev Chat
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", animation: "fadeIn 0.2s" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: msg.color, fontSize: "0.85rem", fontWeight: "bold" }}>{msg.user}</span>
                    <span style={{ color: "#555", fontSize: "0.7rem" }}>{msg.time}</span>
                </div>
                <div style={{ background: "#222", padding: "8px 12px", borderRadius: "0 8px 8px 8px", color: "#e0e0e0", fontSize: "0.9rem", lineHeight: "1.5", border: "1px solid #333" }}>
                    {msg.text}
                </div>
            </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ padding: "15px", borderTop: "1px solid #222", display: "flex", gap: "10px", background: "#16161a" }}>
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, background: "#0f0f12", border: "1px solid #333", color: "white", padding: "8px 12px", borderRadius: "6px", outline: "none", fontSize: "0.9rem" }}
        />
        <button 
            type="submit" 
            style={{ 
                background: "#007acc", 
                color: "white", 
                border: "none", 
                borderRadius: "6px", 
                cursor: "pointer", 
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
