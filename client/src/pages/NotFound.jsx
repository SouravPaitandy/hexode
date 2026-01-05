import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Home, Code2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

const NotFound = () => {
  const navigate = useNavigate();
  const [terminalText, setTerminalText] = useState([
    "> initiating_request...",
    "> resolving_route...",
  ]);

  useEffect(() => {
    const sequence = [
      { text: "> error: route_not_found", delay: 800 },
      { text: "> status: 404 (Not Found)", delay: 1600 },
      {
        text: "> diagnostic: url_did_not_match_any_known_locations",
        delay: 2400,
      },
      { text: "> action_required: user_intervention", delay: 3200 },
    ];

    let timeouts = [];

    sequence.forEach(({ text, delay }) => {
      const timeout = setTimeout(() => {
        setTerminalText((prev) => [...prev, text]);
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-blue-500/30">
      <SEO title="NOT FOUND!" description="" />
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 max-w-2xl w-full flex flex-col items-center gap-8"
      >
        {/* Glitchy 404 Header */}
        <div className="relative">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-white/50 tracking-tighter"
          >
            404!
          </motion.h1>
          <div className="absolute -inset-1 bg-blue-500/40 blur-xl -z-10 rounded-full opacity-50"></div>
        </div>

        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-surface border border-border rounded-lg shadow-2xl overflow-hidden"
        >
          {/* Terminal Header */}
          <div className="bg-card px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="flex-1 text-center text-xs text-muted font-mono">
              system_diagnostic.log
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-4 font-mono text-sm md:text-base bg-black/50 min-h-[200px] flex flex-col gap-1">
            {terminalText.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${
                  line.includes("error") || line.includes("404")
                    ? "text-red-400"
                    : line.includes("action")
                    ? "text-yellow-400"
                    : "text-zinc-400"
                }`}
              >
                {line}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2 h-4 bg-blue-500 mt-1"
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }} // Wait for terminal typeout
          className="flex flex-wrap gap-4 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-card hover:bg-surface hover:border-zinc-500 transition-all text-muted hover:text-foreground font-medium"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background hover:bg-zinc-200 transition-all font-bold shadow-lg shadow-white/5"
          >
            <Home size={18} />
            Return Home
          </Link>

          <Link
            to="/editor/test"
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all font-medium"
          >
            <Code2 size={18} />
            Open Playground
          </Link>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-6 text-zinc-600 text-xs font-mono">
        HEXODE_SYSTEM_V2.0
      </div>
    </div>
  );
};

export default NotFound;
