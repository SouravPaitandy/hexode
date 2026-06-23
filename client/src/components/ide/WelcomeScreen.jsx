import React, { useState } from "react";
import { motion } from "framer-motion";
import { FilePlus, Play, Save, Zap, Code2 } from "lucide-react";
import { SiCplusplus, SiJavascript, SiPython } from "react-icons/si";
import { FaJava } from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const ShortcutItem = ({ icon: Icon, label, keys }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
    className="flex items-center justify-between text-sm text-muted bg-background/30 hover:bg-background/50 px-5 py-3.5 rounded-xl border border-border transition-colors cursor-default w-full max-w-md group"
  >
    <span className="flex items-center gap-3 text-foreground/80 group-hover:text-foreground transition-colors">
      <Icon
        size={18}
        className="text-muted group-hover:text-blue-400 transition-colors"
      />{" "}
      {label}
    </span>
    <div className="flex gap-1.5">
      {keys.map((k, i) => (
        <kbd
          key={i}
          className="font-mono bg-surface px-2 py-1 rounded-md border border-border/50 text-[11px] shadow-sm text-muted group-hover:text-foreground transition-colors"
        >
          {k}
        </kbd>
      ))}
    </div>
  </motion.div>
);

// --- Playground Empty State ---
const PlaygroundEmptyScreen = ({ onCreateFile }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const PLAYGROUND_TEMPLATES = [
    {
      label: "JavaScript",
      file: "playground.js",
      icon: <SiJavascript />,
      color: "#f1e05a",
    },
    {
      label: "Python",
      file: "main.py",
      icon: <SiPython />,
      color: "#3572A5",
    },
    {
      label: "Java",
      file: "Main.java",
      icon: <FaJava />,
      color: "#b07219",
    },
    {
      label: "C++",
      file: "main.cpp",
      icon: <SiCplusplus />,
      color: "#f34b7d",
    },
  ];

  const handleTemplate = (file) => {
    onCreateFile(file);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateFile(newName.trim());
      setNewName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center select-none relative overflow-hidden bg-background">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center w-full px-6 max-w-lg"
      >
        {/* Icon */}
        <div className="mb-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          <img
            src="/logo.png"
            alt="Hexode Logo"
            className="w-24 h-24 relative z-10 drop-shadow-2xl"
          />
        </div>

        {/* Heading */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Playground is empty
          </h1>
          <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
            Pick a language template to start coding instantly, or create a
            custom file.
          </p>
        </motion.div>

        {/* Language Templates */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 w-full mb-6"
        >
          {PLAYGROUND_TEMPLATES.map(({ label, file, icon, color }) => (
            <motion.button
              key={file}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTemplate(file)}
              className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-card hover:bg-surface border border-border hover:border-blue-500/40 transition-all text-sm font-medium text-foreground cursor-pointer text-left"
            >
              <span style={{ color }} className="text-xl">
                {icon}
              </span>
              <div>
                <div
                  className="font-semibold"
                  style={{ color: `group-hover:${color}` }}
                >
                  {label}
                </div>
                <div className="text-[11px] text-muted font-mono">{file}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Custom filename */}
        <motion.div variants={itemVariants} className="w-full">
          {isCreating ? (
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. solution.py"
                onKeyDown={(e) => e.key === "Escape" && setIsCreating(false)}
                className="flex-1 bg-card border border-blue-500 text-foreground px-3 py-2 rounded-lg outline-none text-sm placeholder-muted/50"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-2 bg-card hover:bg-surface border border-border text-muted hover:text-foreground text-sm rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border hover:border-blue-500/50 text-muted hover:text-foreground transition-all text-sm cursor-pointer bg-transparent"
            >
              <Code2 size={15} />
              Custom file name...
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

// --- Regular Project Welcome Screen ---
const WelcomeScreen = ({ projectName, isPlayground, onCreateFile }) => {
  if (isPlayground) {
    return <PlaygroundEmptyScreen onCreateFile={onCreateFile} />;
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center select-none relative overflow-hidden bg-background">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center w-full px-6"
      >
        <motion.div variants={itemVariants} className="mb-8 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
          <img
            src="/logo.png"
            alt="Hexode Logo"
            className="w-24 h-24 relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Hexode IDE
          </h1>
          <p className="text-muted text-base max-w-md mx-auto leading-relaxed">
            You are currently in{" "}
            <span className="text-foreground font-semibold">
              {projectName || "your workspace"}
            </span>
            . Create or select a file to begin coding.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="w-full flex flex-col items-center gap-3"
        >
          <ShortcutItem
            icon={FilePlus}
            label="New File"
            keys={["Explorer", "+"]}
          />
          <ShortcutItem icon={Save} label="Save Project" keys={["Ctrl", "S"]} />
          <ShortcutItem icon={Play} label="Run Code" keys={["Ctrl", "Enter"]} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
