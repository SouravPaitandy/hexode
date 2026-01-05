import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Book,
  Code2,
  Terminal,
  Cpu,
  Users,
  Shield,
  Zap,
  Layout,
  ChevronRight,
  Menu,
  X,
  Search,
  CheckCircle,
} from "lucide-react";
import SEO from "../components/SEO";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Book size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h1 className="text-4xl font-extrabold text-foreground mb-4">
              Hexode Documentation
            </h1>
            <p className="text-lg text-muted leading-relaxed">
              Hexode is a <strong>cloud-native development environment</strong>{" "}
              that brings the power of VS Code to your browser. Built for speed,
              collaboration, and AI-assisted workflows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
              <h3 className="text-blue-500 font-bold mb-2 flex items-center gap-2">
                <Zap size={18} /> Quick Start
              </h3>
              <p className="text-sm text-muted mb-4">
                No account required to try it out. Spin up an ephemeral sandbox
                instantly.
              </p>
              <Link
                to="/editor/test"
                className="inline-flex items-center text-xs font-bold text-blue-500 hover:underline"
              >
                Launch Playground <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
              <h3 className="text-purple-500 font-bold mb-2 flex items-center gap-2">
                <Cpu size={18} /> AI Powered
              </h3>
              <p className="text-sm text-muted">
                Integrated with Google Gemini to debug, refactor, and explain
                code in real-time.
              </p>
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h3 className="text-xl font-bold mt-8 mb-4">Why Hexode?</h3>
            <p className="text-muted">
              Modern development requires flexibility. Hexode allows you to code
              from any device—tablet, laptop, or desktop—without configuring a
              local environment. Your workspace lives in the cloud, always
              ready, always synced.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <Layout size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            <p className="text-muted mt-2">
              Manage your projects, track your activity, and configure your
              workspace settings.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Project Management</h3>
            <p className="text-muted">
              The dashboard gives you a bird's-eye view of all your workspaces.
            </p>
            <ul className="grid gap-3 md:grid-cols-2">
              <li className="bg-card p-4 rounded-lg border border-border">
                <strong className="block mb-1 text-foreground">Create</strong>
                <span className="text-sm text-muted">
                  Start fresh with templates for JS, Python, Java, and C++.
                </span>
              </li>
              <li className="bg-card p-4 rounded-lg border border-border">
                <strong className="block mb-1 text-foreground">Manage</strong>
                <span className="text-sm text-muted">
                  Rename, delete, or open projects directly from the card grid.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg flex gap-4 mt-6">
            <div className="p-2 bg-amber-500/10 rounded-lg h-fit text-amber-500">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-500 text-sm">
                Local vs. Cloud Projects
              </h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Projects created while <strong>signed out</strong> are stored in
                your browser's LocalStorage. They are private to your device.
                Sign in to <strong>sync</strong> them to the Hexode Cloud
                database for permanent access across devices.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "editor",
      title: "The Editor",
      icon: <Code2 size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-foreground">The Editor</h2>
            <p className="text-muted mt-2">
              A production-grade code editor powered by <strong>Monaco</strong>{" "}
              (the core of VS Code).
            </p>
          </div>

          <div className="grid gap-8">
            <section>
              <h3 className="text-xl font-bold mb-4">Core Capabilities</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-card border border-border p-5 rounded-xl">
                  <h4 className="font-semibold mb-2">IntelliSense</h4>
                  <p className="text-sm text-muted">
                    Smart code completion, parameter info, and syntax validation
                    for 5+ languages.
                  </p>
                </div>
                <div className="bg-card border border-border p-5 rounded-xl">
                  <h4 className="font-semibold mb-2">Multi-Cursor</h4>
                  <p className="text-sm text-muted">
                    Hold{" "}
                    <kbd className="bg-surface px-1.5 py-0.5 rounded text-xs border border-border">
                      Alt
                    </kbd>{" "}
                    and click to add multiple cursors for batch editing.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4">
                Command Palette & Shortcuts
              </h3>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-sm bg-card">
                  <thead className="bg-surface text-muted">
                    <tr>
                      <th className="p-3 font-medium">Shortcut</th>
                      <th className="p-3 font-medium">Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-surface/50">
                      <td className="p-3 font-mono text-blue-500">Ctrl + S</td>
                      <td className="p-3 text-muted">
                        Save Project (Trigger Autosave)
                      </td>
                    </tr>
                    <tr className="hover:bg-surface/50">
                      <td className="p-3 font-mono text-blue-500">
                        Ctrl + Enter
                      </td>
                      <td className="p-3 text-muted">Run Code in Terminal</td>
                    </tr>
                    <tr className="hover:bg-surface/50">
                      <td className="p-3 font-mono text-blue-500">Ctrl + /</td>
                      <td className="p-3 text-muted">Toggle Line Comment</td>
                    </tr>
                    <tr className="hover:bg-surface/50">
                      <td className="p-3 font-mono text-blue-500">F1</td>
                      <td className="p-3 text-muted">Open Command Palette</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      ),
    },
    {
      id: "terminal",
      title: "Interactive Terminal",
      icon: <Terminal size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-foreground">
              Interactive Terminal
            </h2>
            <p className="text-muted mt-2">
              Execute code in a secure, isolated sandbox environment.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 font-mono text-sm shadow-2xl">
              <div className="flex gap-1.5 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              <div className="space-y-1">
                <div className="flex gap-2 text-zinc-400">
                  <span className="text-green-500">$</span> python main.py
                </div>
                <div className="text-blue-400">Input required:</div>
                <div className="text-zinc-100">Enter your name: Sourav</div>
                <div className="text-zinc-300">
                  Hello, Sourav! Welcome to Hexode.
                </div>
              </div>
            </div>

            <section>
              <h3 className="text-xl font-bold mb-3">Capabilities</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted items-start">
                  <div className="mt-1 bg-surface p-1 rounded text-foreground">
                    <Zap size={14} />
                  </div>
                  <div>
                    <strong className="text-foreground">
                      Interactive Stdin:
                    </strong>{" "}
                    Unlike basic runners, our terminal supports interactive
                    inputs (e.g., Python <code>input()</code>, C++{" "}
                    <code>cin</code>).
                  </div>
                </li>
                <li className="flex gap-3 text-sm text-muted items-start">
                  <div className="mt-1 bg-surface p-1 rounded text-foreground">
                    <Layout size={14} />
                  </div>
                  <div>
                    <strong className="text-foreground">
                      File System Access:
                    </strong>{" "}
                    Scripts can read/write files in the virtual file system. Use
                    commands like <code>ls</code> and <code>cat</code>.
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      ),
    },
    {
      id: "ai",
      title: "HexodeAI",
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold mb-4">
              v2.0 FEATURE
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              HexodeAI Assistant
            </h2>
            <p className="text-muted mt-2">
              Context-aware pair programming powered by{" "}
              <strong>Google Gemini</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">What it can do</h3>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Explain
                  complex algorithms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Debug
                  runtime errors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Generate
                  React Components
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" /> Refactor
                  messy code
                </li>
              </ul>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl">
              <h4 className="font-bold mb-3">Context Awareness</h4>
              <p className="text-sm text-muted leading-relaxed">
                HexodeAI reads your <strong>currently active file</strong>. You
                don't need to copy-paste code. Just ask "Fix the bug in this
                function" and it knows what you mean.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "collaboration",
      title: "Collaboration",
      icon: <Users size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-foreground">
              Real-time Collab
            </h2>
            <p className="text-muted mt-2">
              Like Google Docs for code. Work together in real-time with zero
              latency.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-bold mb-2">Guest Access Roles</h3>
              <p className="text-sm text-muted">
                Control who can edit your project.
              </p>
            </div>
            <div className="p-6 grid gap-6 md:grid-cols-2">
              <div>
                <div className="font-bold text-green-500 mb-1">Owner</div>
                <p className="text-sm text-muted">
                  Full control. Can delete files, ban users, and toggle project
                  visibility.
                </p>
              </div>
              <div>
                <div className="font-bold text-blue-500 mb-1">Guest</div>
                <p className="text-sm text-muted">
                  By default <strong>Read-Only</strong> (Spectator). Can be
                  granted <strong>Edit</strong> access by the owner.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: <Shield size={18} />,
      content: (
        <div className="space-y-6">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl font-bold text-foreground">
              Security First
            </h2>
            <p className="text-muted mt-2">
              Your code is your intellectual property. We keep it safe.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex gap-4 p-4 bg-surface rounded-xl">
              <div className="mt-1">
                <Shield size={20} className="text-green-500" />
              </div>
              <div>
                <h4 className="font-bold">Sandboxed Execution</h4>
                <p className="text-sm text-muted mt-1">
                  Code runs in isolated Piston containers. No access to the host
                  server.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-surface rounded-xl">
              <div className="mt-1">
                <Layout size={20} className="text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold">Ephemeral Playgrounds</h4>
                <p className="text-sm text-muted mt-1">
                  Anonymous playground sessions are wiped from memory when you
                  disconnect.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex bg-background min-h-screen text-foreground font-sans">
      <SEO
        title="Documentation"
        description="Comprehensive guides for Hexode. Learn about the Editor, Terminal, HexodeAI, and Collaboration features."
      />

      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <div className="font-bold flex items-center gap-2">
          <Book size={20} className="text-blue-500" /> Docs
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <motion.aside
        initial={{ x: window.innerWidth < 768 ? "-100%" : 0 }}
        animate={{ x: isMobile && !isSidebarOpen ? "-100%" : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed md:sticky md:top-0 h-screen w-64 bg-surface/95 backdrop-blur-xl border-r border-border p-6 pt-20 md:pt-6 z-40 overflow-y-auto"
      >
        <div className="mb-8 hidden md:flex items-center gap-2 font-bold text-xl">
          <img src="./logo.png" alt="Hexode" className="w-9 h-9" />
          Hexode
        </div>

        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={16}
          />
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <nav className="space-y-1">
          {sections
            .filter((s) =>
              s.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsSidebarOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full truncate flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-blue-500/10 text-blue-500"
                    : "text-muted hover:text-foreground hover:bg-card"
                }`}
              >
                {section.icon}
                <span className="truncate whitespace-nowrap">
                  {section.title}
                </span>
                {activeSection === section.id && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-border">
          <Link
            to="/"
            className="text-sm text-muted hover:text-foreground flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 md:max-w-4xl pt-24 md:pt-12 min-h-screen flex flex-col">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {sections.find((s) => s.id === activeSection)?.content}
        </motion.div>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-6">
          {sections.findIndex((s) => s.id === activeSection) > 0 ? (
            <button
              onClick={() => {
                setActiveSection(
                  sections[
                    sections.findIndex((s) => s.id === activeSection) - 1
                  ].id
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex-1 flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-card transition-all text-left"
            >
              <span className="text-xs text-muted font-mono flex items-center gap-1 group-hover:text-blue-500">
                <ChevronRight size={12} className="rotate-180" /> Previous
              </span>
              <span className="font-bold text-foreground">
                {
                  sections[
                    sections.findIndex((s) => s.id === activeSection) - 1
                  ].title
                }
              </span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {sections.findIndex((s) => s.id === activeSection) <
          sections.length - 1 ? (
            <button
              onClick={() => {
                setActiveSection(
                  sections[
                    sections.findIndex((s) => s.id === activeSection) + 1
                  ].id
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group flex-1 flex flex-col gap-2 p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-card transition-all text-right items-end"
            >
              <span className="text-xs text-muted font-mono flex items-center gap-1 group-hover:text-blue-500">
                Next <ChevronRight size={12} />
              </span>
              <span className="font-bold text-foreground">
                {
                  sections[
                    sections.findIndex((s) => s.id === activeSection) + 1
                  ].title
                }
              </span>
            </button>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Footer */}
        {/* <div className="mt-12 text-center text-sm text-muted">
          Built with ❤️ by Sourav Paitandy • Hexode v2.0
        </div> */}
        <div className="mt-12 text-center text-zinc-600 text-xs font-mono pointer-events-none">
          HEXODE_SYSTEM_V2.0
        </div>
      </main>
    </div>
  );
};

export default Docs;
