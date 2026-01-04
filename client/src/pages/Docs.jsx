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
} from "lucide-react";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            Hexode Documentation
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            Welcome to the official documentation for{" "}
            <strong>Hexode System v2.0</strong>. Hexode is a next-generation
            cloud development environment designed for speed, collaboration, and
            AI-assisted workflows.
          </p>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
              <Zap size={18} /> Quick Start
            </h3>
            <p className="text-sm text-muted">
              Jump straight into coding without an account by visiting the{" "}
              <Link to="/editor/test" className="text-blue-400 hover:underline">
                Playground
              </Link>
              .
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "dashboard",
      title: "Dashboard & Projects",
      icon: <Layout size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted">
            The Dashboard is your command center. Access all your projects,
            create new ones, and manage your account settings.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>
              <strong>Create Project:</strong> Click the "New Project" card. We
              support JavaScript, Python, Java, C++, and more.
            </li>
            <li>
              <strong>Smart Search:</strong> Use the search bar to filter
              projects by name instantly.
            </li>
            <li>
              <strong>Project Management:</strong> Rename or delete projects
              using the actions menu on each card.
            </li>
          </ul>
          <div className="bg-surface border border-border p-4 rounded-lg">
            <div className="text-xs font-mono text-zinc-500 mb-2">PRO TIP</div>
            <p className="text-sm text-muted">
              Local projects (created while signed out) are stored in your
              browser. Sign in to sync them to the cloud permanently.
            </p>
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
          <h2 className="text-3xl font-bold text-foreground">The Editor</h2>
          <p className="text-muted">
            A powerful Monaco-based editor with syntax highlighting, intelligent
            autocomplete, and real-time collaboration.
          </p>

          <h3 className="text-xl font-bold text-foreground mt-8">
            Key Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <h4 className="font-bold mb-2">File System</h4>
              <p className="text-sm text-muted">
                Create, rename, and delete files/folders. Drag and drop support
                coming soon.
              </p>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <h4 className="font-bold mb-2">Smart Autosave</h4>
              <p className="text-sm text-muted">
                Changes are saved automatically. You can also press{" "}
                <kbd className="bg-surface px-1 rounded">Ctrl+S</kbd> to force
                save.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-foreground mt-8">Shortcuts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-muted">
                <tr>
                  <th className="p-2">Shortcut</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2 font-mono text-blue-400">Ctrl + S</td>
                  <td className="p-2 text-muted">Save Project</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono text-blue-400">Ctrl + Enter</td>
                  <td className="p-2 text-muted">Run Code</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono text-blue-400">Ctrl + /</td>
                  <td className="p-2 text-muted">Toggle Comment</td>
                </tr>
              </tbody>
            </table>
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
          <h2 className="text-3xl font-bold text-foreground">
            Interactive Terminal
          </h2>
          <p className="text-muted">
            Hexode features a simulated terminal environment powered by the
            Piston API.
          </p>
          <div className="space-y-4">
            <div className="bg-black/80 p-4 rounded-lg border border-zinc-800 font-mono text-sm">
              <div className="text-green-400">$ run</div>
              <div className="text-zinc-300">
                Compiling and executing script.js...
              </div>
              <div className="text-white">Hello World!</div>
            </div>
            <p className="text-muted">
              <strong>Standard Input (stdin):</strong> The terminal supports
              interactive programs. When your code requires input (e.g.{" "}
              <code>input()</code> in Python), the terminal will pause and
              prompt you to type.
            </p>
            <p className="text-muted">
              <strong>Commands:</strong> Use <code>ls</code> to list files,{" "}
              <code>cat [file]</code> to read content, and <code>clear</code> or{" "}
              <code>cls</code> to try reset the view.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "ai",
      title: "HexodeAI Assistant",
      icon: <Cpu size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            HexodeAI Assistant
          </h2>
          <p className="text-muted">
            Your intelligent pair programmer. HexodeAI is context-aware, meaning
            it can read your currently open file to provide relevant
            suggestions.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>
              <strong>Explain Code:</strong> Highlight a block and ask HexodeAI
              to explain it.
            </li>
            <li>
              <strong>Debug:</strong> Paste error messages or ask "Why isn't
              this working?"
            </li>
            <li>
              <strong>Generate:</strong> Ask "Create a React counter component"
              and use the
              <strong> Insert Code</strong> button to place it directly in your
              file.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "collaboration",
      title: "Collaboration",
      icon: <Users size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Real-time Collaboration
          </h2>
          <p className="text-muted">
            Code together in real-time. Share your project URL to invite others.
          </p>

          <h3 className="text-xl font-bold text-foreground mt-6">
            Guest Access Control
          </h3>
          <p className="text-muted">
            By default, shared links are <strong>Read-Only</strong>. To allow
            others to edit:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted">
            <li>
              Click the <strong>Share</strong> button in the header.
            </li>
            <li>
              Toggle <strong>Guest Edit Access</strong> to "Enabled".
            </li>
            <li>
              The link now grants write permissions. Toggle it off anytime to
              revoke access.
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: "security",
      title: "Security & Privacy",
      icon: <Shield size={18} />,
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-foreground">
            Security & Privacy
          </h2>
          <p className="text-muted">Hexode is built with security in mind.</p>
          <ul className="list-disc pl-6 space-y-2 text-muted">
            <li>
              <strong>Playground Mode:</strong> Code in the playground is
              ephemeral and deletes upon session end.
            </li>
            <li>
              <strong>Secure Sandbox:</strong> Code execution happens in
              isolated containers via Piston.
            </li>
            <li>
              <strong>Ownership:</strong> Only the project owner can delete the
              project or change visibility settings.
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row">
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
        className="fixed md:sticky md:top-0 h-screen w-64 bg-transparent backdrop-blur-sm border-r border-border p-6 pt-20 md:pt-6 z-40 overflow-y-auto"
      >
        <div className="mb-8 hidden md:flex items-center gap-2 font-bold text-xl">
          <img src="./logo.png" alt="Hexode" className="w-10 h-10" />
          Hexode
        </div>

        <nav className="space-y-1">
          {sections.map((section) => (
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
      <main className="flex-1 p-6 md:p-12 md:max-w-4xl pt-24 md:pt-12 min-h-screen flex flex-col items-center justify-between">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sections.find((s) => s.id === activeSection)?.content}
        </motion.div>

        {/* Footer */}
        <div className="mt-12 pt-6 text-center text-sm text-muted">
          Built with ❤️ by Sourav Paitandy • Hexode v2.0
        </div>
      </main>
    </div>
  );
};

export default Docs;
