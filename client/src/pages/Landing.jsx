import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Lenis from "lenis";
import { Link } from "react-router-dom";
import {
  Code2,
  Users,
  Terminal,
  Globe,
  Layout,
  Github,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Zap,
  Cloud,
  Cpu,
  Server,
  CheckCircle,
  Star,
  Shield,
  Coffee,
} from "lucide-react";
import { FaGithub, FaJava } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";
import SEO from "../components/SEO";
import { SiCss3, SiJavascript, SiPython } from "react-icons/si";

const mockFiles = [
  {
    name: "demo.py",
    icon: SiPython,
    iconColor: "text-blue-400",
    command: "python demo.py",
    output: "Hello, Reviewer!",
    headerHTML: (
      <>
        <div className="text-purple-400">
          def <span className="text-yellow-200">main</span>():
        </div>
        <div className="pl-6 text-emerald-600/80 italic">
          # Your code runs instantly
        </div>
      </>
    ),
    fullText: "print('Hello, Reviewer!')",
    footerHTML: null,
  },
  {
    name: "index.js",
    icon: SiJavascript,
    iconColor: "text-[#f1e05a]",
    command: "node index.js",
    output: "Hexode is incredibly fast!",
    headerHTML: (
      <>
        <div className="text-emerald-600/80 italic">
          // Real-time collaborative IDE
        </div>
      </>
    ),
    fullText: "console.log('Hexode is incredibly fast!');",
    footerHTML: null,
  },
  {
    name: "App.java",
    icon: FaJava,
    iconColor: "text-[#b07219]",
    command: "javac App.java && java App",
    output: "AI Native IDE",
    headerHTML: (
      <>
        <div className="text-purple-400">
          public class <span className="text-yellow-200">App</span> {"{"}
        </div>
        <div className="pl-6">
          <span className="text-purple-400">public static void</span>{" "}
          <span className="text-yellow-200">main</span>(String[] args) {"{"}
        </div>
        <div className="pl-12 text-emerald-600/80 italic">
          // Write once, run anywhere in cloud
        </div>
      </>
    ),
    fullText: 'System.out.println("AI Native IDE");',
    footerHTML: (
      <>
        <div className="pl-6">{"}"}</div>
        <div>{"}"}</div>
      </>
    ),
  },
];

const Landing = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const opacity = useTransform(scrollY, [0, 600, 1000], [0.3, 1, 0]);

  const [activeMockIndex, setActiveMockIndex] = useState(0);
  const activeMock = mockFiles[activeMockIndex];
  const [typedText, setTypedText] = useState("");

  const [pillTextIndex, setPillTextIndex] = useState(0);
  const pillTexts = ["Get Set Code!", "Version 3.0 is live 🚀"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPillTextIndex((prev) => (prev + 1) % pillTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTypedText("");
    let i = 0;
    const fullText = activeMock.fullText;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, i + 1));
      i++;
      if (i > fullText.length) {
        i = 0;
        setTimeout(() => setTypedText(""), 2000);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeMockIndex]);

  const lenisRef = useRef(null);

  // Smooth Scroll (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetId);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-blue-500/30">
      <SEO
        title="The Future of Cloud Coding"
        description="Experience the next generation of cloud IDEs. Zero setup, real-time collaboration, and AI-powered coding assistance. Write and run Java, Python, JavaScript, C++ and more."
        keywords="cloud ide, online compiler, collaborative coding, real-time editor, hexode, pair programming, online code editor"
      />
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[140px] animate-pulse dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] dark:mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/15 rounded-full blur-[120px] dark:mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-x-0 border-t-0 rounded-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" onClick={(e) => handleScroll(e, "#hero")}>
            <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
              <img src="logo.png" alt="</>" className="w-9 h-9" />
              <span>Hexode</span>
            </div>
          </a>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a
              href="#architecture"
              onClick={(e) => handleScroll(e, "#architecture")}
              className="hover:text-foreground transition-colors"
            >
              Architecture
            </a>
            <a
              href="#features"
              onClick={(e) => handleScroll(e, "#features")}
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <Link
              to="/docs"
              className="text-foreground transition-colors font-semibold"
            >
              Docs
            </Link>
            <a
              href="https://github.com/souravpaitandy/hexode"
              target="_blank"
              rel="noopener noreferrer"
              title="Star us on GitHub"
              className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors font-medium group"
            >
              <Star
                size={16}
                className="text-yellow-500 group-hover:fill-yellow-500 transition-all"
              />
              GitHub
            </a>
            <Link
              to="/sponsor"
              title="Support the Project"
              className="flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors font-medium group"
            >
              <Coffee
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              Sponsor
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="bg-black dark:bg-white text-gray-100 dark:text-black px-5 py-2 rounded-full font-medium hover:bg-black/80 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10 hidden md:block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-border mb-8 text-sm font-medium text-muted hover:bg-card transition-colors cursor-default overflow-hidden">
            {/* Shimmer/Sweep Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ["-150%", "150%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />

            {/* Text Animation */}
            <div className="relative w-[150px] h-5 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={pillTextIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute whitespace-nowrap"
                >
                  {pillTexts[pillTextIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[1.1]">
            <span className="inline-block bg-clip-text text-transparent bg-linear-to-b from-[#0f172a] via-[#0f172a] to-[#64748b] dark:from-white dark:via-white dark:to-white/50 pb-2">
              Collaborative IDE
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              Hexode
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            A high-performance cloud code editor featuring{" "}
            <span className="text-foreground font-medium">real-time sync</span>,
            context-aware{" "}
            <span className="text-foreground font-medium">AI assistance</span>,
            and instant{" "}
            <span className="text-foreground font-medium">
              polyglot execution
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link
              to="/play"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-gray-300 rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Code2 size={18} />
              Open Playground
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-3.5 bg-surface border border-border text-foreground hover:bg-card rounded-xl font-bold text-base shadow-lg shadow-black/5 dark:shadow-black/50 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Mock IDE Interface */}
        <motion.div
          style={{ y: y1, opacity }}
          className="relative select-none max-w-5xl mx-auto rounded-2xl glass-panel shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden"
        >
          {/* Window Controls */}
          <div className="h-10 border-b border-border flex items-center px-4 gap-2 bg-black/20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 text-center text-xs text-muted font-mono">
              Hexode - Untitled Project
            </div>
          </div>

          <div className="flex h-[400px] md:h-[500px] text-left">
            {/* Mock Sidebar */}
            <div className="hidden md:block w-56 border-r border-border p-3 space-y-1 bg-card/30">
              <div className="text-xs font-bold text-muted uppercase tracking-wider px-2 mb-3 mt-2">
                Explorer
              </div>
              {mockFiles.map((file, idx) => {
                const Icon = file.icon;
                const isActive = activeMockIndex === idx;
                return (
                  <div
                    key={file.name}
                    onClick={() => setActiveMockIndex(idx)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                      isActive
                        ? "text-blue-400 bg-blue-500/10 border border-blue-500/20 font-medium"
                        : "text-muted hover:bg-foreground/5"
                    }`}
                  >
                    <Icon
                      className={isActive ? "" : file.iconColor}
                      size={14}
                    />
                    <span>{file.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-background/50 border-r border-border">
              {/* Code Area */}
              <div className="flex-1 p-6 font-mono text-sm md:text-base text-foreground relative">
                {activeMock.headerHTML}
                <div
                  className={
                    activeMock.name === "App.java"
                      ? "pl-12"
                      : activeMock.name === "demo.py"
                        ? "pl-6"
                        : ""
                  }
                >
                  {typedText}
                  {typedText.length === activeMock.fullText.length && (
                    <span className="text-muted/40 italic ml-2 hidden sm:inline">
                      # Press Tab to accept AI suggestion
                    </span>
                  )}
                  <span className="animate-pulse text-blue-400">|</span>
                </div>
                {activeMock.footerHTML}
              </div>

              {/* Terminal Strip */}
              <div className="h-32 border-t border-border bg-card/50 p-4 font-mono text-xs md:text-sm flex flex-col">
                <div className="flex items-center gap-2 text-muted mb-2 uppercase text-[10px] tracking-widest font-bold">
                  <Terminal size={12} /> Terminal
                </div>
                <div className="text-emerald-400 flex-1 overflow-hidden">
                  <span className="text-blue-400">$</span> {activeMock.command}
                  <br />
                  <span className="text-foreground mt-1 block">
                    {activeMock.output}
                  </span>
                </div>
              </div>
            </div>

            {/* Mock AI Assistant Panel */}
            <div className="hidden lg:flex w-72 bg-card/30 flex-col">
              <div className="h-10 border-b border-border flex items-center px-4 gap-2 text-xs font-bold text-muted uppercase tracking-wider">
                <Sparkles size={14} className="text-purple-500" /> Hexode AI
              </div>
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden relative">
                <div className="bg-background border border-border rounded-lg p-3 text-xs text-muted shadow-sm">
                  <p className="font-medium text-foreground mb-1">User</p>
                  <p>Can you optimize this main function?</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-muted shadow-sm">
                  <p className="font-medium text-blue-400 mb-1 flex items-center gap-1">
                    <Sparkles size={10} /> Hexode AI
                  </p>
                  <p>
                    Certainly! I've reviewed your code. Here is an optimized
                    version using generators...
                  </p>
                  <div className="mt-2 bg-[#0d1117] rounded p-2 border border-border font-mono text-[10px] text-gray-300">
                    <span className="text-purple-400">def</span>{" "}
                    <span className="text-yellow-200">main</span>():
                    <br />
                    &nbsp;&nbsp;
                    <span className="text-purple-400">yield from</span>{" "}
                    range(10)
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-border">
                <div className="h-8 bg-background border border-border rounded flex items-center px-3 text-xs text-muted">
                  Ask Hexode AI...
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Built For Speed Section */}
      <section
        id="architecture"
        className="py-24 border-y border-border bg-surface/30"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 glass-panel rounded-2xl">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Compute</h3>
              <p className="text-muted text-sm leading-relaxed">
                Execute C++, Java, Python, and JS instantly in isolated
                environments without installing local toolchains.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 glass-panel rounded-2xl">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiplayer Sync</h3>
              <p className="text-muted text-sm leading-relaxed">
                Zero-latency state synchronization. See cursors and code changes
                in real-time with zero conflicts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 glass-panel rounded-2xl">
              <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-muted text-sm leading-relaxed">
                Context-aware HexodeAI built directly into the editor to explain
                code, find bugs, and refactor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Code Like a <span className="text-blue-500">Pro</span>.
          </h2>
          <p className="text-muted text-lg">
            Engineering excellence built into every pixel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Collab (Large) */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-8 rounded-3xl glass-panel hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">CRDT Multi-User Sync</h3>
              <p className="text-muted max-w-md leading-relaxed">
                State synchronization powered by <strong>Y.js</strong> and
                WebSockets. Millisecond-latency updates ensuring every keystroke
                is shared instantly without conflicts.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Polyglot (Vertical) */}
          <motion.div
            whileHover={{ y: -5 }}
            className="md:row-span-2 p-8 rounded-3xl glass-panel hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 group-hover:bg-emerald-500/30 transition-all duration-500"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                <Terminal size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Polyglot Sandbox</h3>
              <p className="text-muted mb-8 flex-1">
                Secure remote code execution supporting standard input/output.
              </p>
              <div className="space-y-3">
                {[
                  {
                    l: "Python 3",
                    c: "text-yellow-400",
                    bg: "bg-yellow-400/10",
                  },
                  { l: "Node.js", c: "text-green-400", bg: "bg-green-400/10" },
                  { l: "C++", c: "text-blue-400", bg: "bg-blue-400/10" },
                  { l: "Java", c: "text-red-400", bg: "bg-red-400/10" },
                ].map((fw) => (
                  <div
                    key={fw.l}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${fw.c} ${fw.bg} shadow-[0_0_8px_currentColor]`}
                    ></div>
                    <span className="font-mono text-sm">{fw.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 3: HexodeAI */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl glass-panel hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/30 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 text-pink-400">
                <Cpu size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">HexodeAI Assistant</h3>
              <p className="text-muted text-sm leading-relaxed">
                Context-aware pair programming. Generate code, debug errors, and
                refactor instantly with our embedded AI engine.
              </p>
            </div>
          </motion.div>

          {/* Card 4: Access Control */}
          <motion.div
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl glass-panel hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/30 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6 text-amber-400">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Access</h3>
              <p className="text-muted text-sm leading-relaxed">
                Granular permissions for your workspace. Toggle{" "}
                <strong>Guest Edit</strong> access on the fly to collaborate
                securely.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-blue-900/10 via-transparent to-transparent"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto glass-panel p-12 md:p-20 rounded-[2.5rem] border border-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.1)] overflow-hidden group"
        >
          {/* Subtle Hover Glow inside the card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none transition-opacity duration-700 opacity-50 group-hover:opacity-100"></div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 relative z-10 tracking-tight">
            Ready to build something?
          </h2>
          <p className="text-xl text-muted mb-10 relative z-10 max-w-2xl mx-auto">
            Join the session and experience the future of collaborative coding.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(59,130,246,0.4)] w-full sm:w-auto justify-center"
            >
              Launch Editor
            </Link>
            <a
              href="https://github.com/souravpaitandy/hexode"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-4 bg-surface/50 border border-border hover:bg-card text-foreground rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg w-full sm:w-auto justify-center backdrop-blur-md"
            >
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              Star on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="rounded-t-[2.5rem] md:rounded-none border-t border-border bg-surface md:bg-background text-muted text-sm -mt-8 md:mt-0 relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <img src="logo.png" alt="</>" className="w-5 h-5" />
              <span className="text-foreground font-semibold font-mono">
                HEXODE v3.0
              </span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://github.com/souravpaitandy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/sourav-paitandy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://x.com/PaitandySourav"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://github.com/souravpaitandy/hexode/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                License
              </a>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
            <p>An open-source project. Contributions are welcome!</p>
            <p>
              Developed by{" "}
              <a
                href="https://www.souravpaitandy.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted underline hover:text-foreground transition-colors"
              >
                Sourav Paitandy
              </a>{" "}
              with Grit and Passion for developers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
