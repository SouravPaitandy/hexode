import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Folder,
  Clock,
  MoreVertical,
  Trash2,
  Code,
  Edit2,
  Check,
  Layout,
  Search,
  Zap,
  X,
  Coffee,
} from "lucide-react";
import { SiC, SiCplusplus, SiJavascript, SiPython } from "react-icons/si";
import { FaJava } from "react-icons/fa";
import ThemeToggle from "../components/ThemeToggle";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import axios from "axios";
import { useModal } from "../context/ModalContext";
import { useToast } from "../components/Toast";
import SEO from "../components/SEO";

const Dashboard = () => {
  const navigate = useNavigate();
  const { confirm } = useModal();
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { addToast } = useToast();

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectLang, setNewProjectLang] = useState("JavaScript");

  const [filterLang, setFilterLang] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const timeAgo = (dateString) => {
    if (dateString === "Demo") return "Demo Project";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const LANG_COLORS = {
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555599",
    Default: "#ccc",
  };

  // Demo Data
  const DEMO_PROJECTS = [
    {
      id: "demo-python",
      name: "Python Algorithms",
      lang: "Python",
      createdAt: new Date(Date.now() - 100000000).toISOString(),
    },
    {
      id: "demo-java",
      name: "Java Backend Service",
      lang: "Java",
      createdAt: new Date(Date.now() - 200000000).toISOString(),
    },
    {
      id: "demo-cpp",
      name: "C++ Game Engine",
      lang: "C++",
      createdAt: new Date(Date.now() - 300000000).toISOString(),
    },
  ];

  const { user, isSignedIn, isLoaded } = useUser();
  const [isLoading, setIsLoading] = React.useState(true);

  const hasLoaded = React.useRef(false);

  // ── Global Dashboard Shortcuts ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape: Close modals
      if (e.key === "Escape") {
        setIsCreateOpen(false);
      }

      // Ctrl/Cmd + K: Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("project-search")?.focus();
      }

      // Ctrl/Cmd + N: New Project
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsCreateOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load Projects (Hybrid: Local + DB)
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadProjects = async () => {
      // 1. Load Local, logic unchanged...
      const saved = localStorage.getItem("devdock-projects");
      let local = saved ? JSON.parse(saved) : [];

      // Seeding for new users (Local only)
      if (!localStorage.getItem("devdock-demos-v1") && local.length === 0) {
        local = [...DEMO_PROJECTS];
        localStorage.setItem("devdock-projects", JSON.stringify(local));
        localStorage.setItem("devdock-demos-v1", "true");
      }

      if (isSignedIn) {
        try {
          const API_URL =
            import.meta.env.VITE_API_URL || "http://localhost:3001";
          // 1b. Sync User to DB
          await axios.post(`${API_URL}/api/users/sync`, {
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            name: user.fullName || user.firstName,
          });

          // 2. Sync Local -> DB (Once)
          if (local.length > 0) {
            // console.log("Syncing local projects to DB...", local);
            await Promise.all(
              local.map((p) =>
                axios.post(`${API_URL}/api/rooms`, {
                  roomId: p.id,
                  ownerId: user.id,
                  name: p.name,
                  lang: p.lang,
                }),
              ),
            );
            localStorage.removeItem("devdock-projects"); // Clear local after sync
            local = [];
          }

          // 3. Fetch from DB & Deduplicate
          const res = await axios.get(
            `${API_URL}/api/rooms?ownerId=${user.id}`,
          );
          const dbProjects = res.data;

          // --- Deduplication Logic ---
          // Keep the most recent project for each ID? Or just unique by ID.
          const uniqueProjects = [];
          const seenIds = new Set();

          // Sort by lastModified (desc) if available, or just trust order
          dbProjects.forEach((p) => {
            if (!seenIds.has(p.roomId)) {
              seenIds.add(p.roomId);
              uniqueProjects.push(p);
            } else {
              // Found a duplicate! We should probably delete the others from DB to clean up?
              // For now, just filtering them out from UI is safer than auto-deleting data
              console.warn(
                `[Dashboard] Duplicate project ID filtered: ${p.roomId}`,
              );
            }
          });

          setProjects(uniqueProjects);
        } catch (err) {
          console.error("Failed to fetch/sync projects", err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setProjects(local);
        setIsLoading(false);
      }
    };

    if (isSignedIn && user?.id) {
      // Only run if auth is ready
      loadProjects();
    } else if (!isSignedIn && isLoaded) {
      // Wait for Clerk to load
      // If we are sure user is NOT signed in (auth loaded), load local
      loadProjects();
    } else {
      hasLoaded.current = false;
    }
  }, [isSignedIn, user?.id, isLoaded]); // Depend on user.id to ensure it's loaded

  const handleNewProject = () => {
    setNewProjectName("");
    setNewProjectLang("JavaScript");
    setIsCreateOpen(true);
  };

  const createProject = async (e) => {
    if (e) e.preventDefault();
    const id = "proj-" + Math.floor(Math.random() * 100000);
    const safeName = newProjectName.trim() || "Untitled Project";
    const newProject = {
      id,
      roomId: id,
      name: safeName,
      lang: newProjectLang,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setIsCreateOpen(false);

    if (isSignedIn) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        await axios.post(`${API_URL}/api/rooms`, {
          roomId: id,
          ownerId: user.id,
          name: newProject.name,
          lang: newProject.lang,
        });
        setProjects([newProject, ...projects]);
      } catch (err) {
        console.error(err);
        addToast("Failed to create project", "error");
        return;
      }
    } else {
      const updated = [newProject, ...projects];
      setProjects(updated);
      localStorage.setItem("devdock-projects", JSON.stringify(updated));
    }
    navigate(`/editor/${id}`);
  };

  const deleteProject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: "Delete Project?",
      message:
        "Are you sure you want to delete this project? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
      onConfirm: async () => {
        const updated = projects.filter((p) => (p.roomId || p.id) !== id);
        setProjects(updated);

        if (isSignedIn) {
          try {
            const API_URL =
              import.meta.env.VITE_API_URL || "http://localhost:3001";
            await axios.delete(`${API_URL}/api/rooms/${id}`);
          } catch (err) {
            console.error("Failed to delete project", err);
            // alert("Failed to delete project from server");
            // Consider toast here if available, but modal closes anyway
            addToast("Failed to delete project from server", "error");
          }
        } else {
          localStorage.setItem("devdock-projects", JSON.stringify(updated));
        }
      },
    });
  };

  const startEditing = (e, p) => {
    e.preventDefault();
    setEditingId(p.roomId || p.id);
    setEditName(p.name);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    // Optimistic Update
    const updated = projects.map((p) =>
      (p.roomId || p.id) === editingId ? { ...p, name: editName } : p,
    );
    setProjects(updated);

    if (isSignedIn) {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
        await axios.put(`${API_URL}/api/rooms/${editingId}`, {
          name: editName,
        });
      } catch (err) {
        console.error("Failed to rename project", err);
        // alert("Failed to save changes");
      }
    } else {
      localStorage.setItem("devdock-projects", JSON.stringify(updated));
    }

    setEditingId(null);
  };

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = p.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLang = filterLang === "All" || p.lang === filterLang;
      return matchesSearch && matchesLang;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.lastModified) - new Date(a.lastModified);
      if (sortBy === "oldest")
        return new Date(a.lastModified) - new Date(b.lastModified);
      if (sortBy === "a-z") return a.name.localeCompare(b.name);
      if (sortBy === "z-a") return b.name.localeCompare(a.name);
      return 0;
    });

  return (
    <div className="bg-background min-h-screen text-foreground font-sans relative flex flex-col overflow-x-hidden">
      <SEO
        title="Dashboard"
        description="Manage your Hexode projects. Create, edit, and collaborate on code instantly."
      />
      {/* Futuristic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[150px] dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] dark:mix-blend-screen" />
      </div>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-b border-border flex justify-between items-center glass-panel shadow-md">
        <a href="/">
          <div className="text-2xl font-bold flex items-center gap-3 text-foreground">
            {/* <div className="bg-linear-to-br from-blue-600 to-cyan-400 p-2 rounded-xl flex shadow-lg shadow-blue-500/30">
                    <Code size={22} color="white" />
                </div> */}
            <img src="logo.png" alt="</>" className="w-9 h-9" />
            Hexode
          </div>
        </a>
        <div className="flex gap-5 items-center">
          <Link
            to="/docs"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors hidden md:block"
          >
            Docs
          </Link>
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
          <ThemeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>

      <div className="pt-32 px-2 mb-12 md:px-8 max-w-[1400px] mx-auto">
        {/* Welcome */}
        <div className="mb-12 flex justify-between items-end relative z-10">
          <div>
            <h1 className="text-5xl font-black mb-3 tracking-tight">
              <span className="text-foreground">
                Welcome back, {isSignedIn ? user.fullName : "Coder"}
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">
              Your Hexode environment is ready.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end md:items-center">
          {/* Language Filter */}
          <div className="flex gap-2 overflow-x-auto p-2 w-full md:w-auto no-scrollbar">
            {["All", "JavaScript", "Python", "Java", "C++", "C"].map((lang) => {
              let count = projects.filter(
                (p) => lang === "All" || p.lang === lang,
              ).length;

              return (
                <button
                  key={lang}
                  onClick={() => setFilterLang(lang)}
                  className={`relative group px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filterLang === lang
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted hover:border-zinc-500"
                  }`}
                >
                  {lang}
                  <span
                    className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] px-1 rounded-full shadow-sm ring-2 ring-background ${
                      filterLang === lang
                        ? "bg-blue-600 text-white font-bold"
                        : "bg-surface border border-border text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-56 shrink-0">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                id="project-search"
                type="text"
                placeholder="Search projects... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-card border border-border rounded-lg py-1.5 pl-9 pr-3 text-foreground focus:outline-none focus:border-blue-500 text-sm transition-colors placeholder:text-muted"
              />
            </div>
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 cursor-pointer text-foreground"
              >
                <option value="newest">Last Edited (Newest)</option>
                <option value="oldest">Last Edited (Oldest)</option>
                <option value="a-z">Name (A-Z)</option>
                <option value="z-a">Name (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12 relative z-10">
          {/* New Project Card */}
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(59,130,246,0.15)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewProject}
            className="group border border-blue-500/30 rounded-2xl bg-blue-500/5 flex flex-col justify-center items-center cursor-pointer text-blue-400 min-h-[200px] transition-all hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-blue-500/20 p-4 rounded-full mb-4 group-hover:bg-blue-500/30 group-hover:scale-110 transition-transform relative z-10">
              <Plus size={24} className="text-blue-400" />
            </div>
            <span className="font-bold relative z-10 uppercase tracking-wider text-sm">
              Initialize Workspace
            </span>
            <span className="text-blue-500/50 text-xs font-mono mt-1 relative z-10">
              Ctrl + N
            </span>
          </motion.button>

          {/* Loading Skeletons */}
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl glass-panel p-6 min-h-[200px] animate-pulse shadow-sm"
                >
                  <div className="h-4 bg-border rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-border rounded w-1/2 mb-6"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-border rounded w-16"></div>
                    <div className="h-6 bg-border rounded w-20"></div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <Search size={36} className="text-foreground mb-4" />
              <p className="text-foreground font-semibold">No projects found</p>
              <p className="text-muted text-sm mt-1">
                Try a different filter or create a new project.
              </p>
            </div>
          ) : (
            /* Existing project cards */
            <AnimatePresence>
              {filteredProjects.map((p) => (
                <motion.div
                  key={p.roomId || p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout
                >
                  <Link
                    to={`/editor/${p.roomId || p.id}`}
                    className="block h-full no-underline text-inherit"
                  >
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="p-6 glass-panel rounded-2xl border border-border h-full flex flex-col justify-between hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group"
                    >
                      <div>
                        <div className="flex justify-between mb-5 items-start">
                          <div className="bg-foreground/5 p-2.5 rounded-xl">
                            <Folder size={20} className="text-muted" />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => startEditing(e, p)}
                              className="p-1.5 rounded-md text-muted hover:bg-foreground hover:text-background transition-colors"
                              aria-label="Rename project"
                              title="Rename project"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) =>
                                deleteProject(e, p.roomId || p.id)
                              }
                              className="p-1.5 rounded-md text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              aria-label="Delete project"
                              title="Delete project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {editingId === (p.roomId || p.id) ? (
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.preventDefault()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(e);
                            }}
                            onBlur={saveEdit}
                            className="bg-background border border-blue-500 text-foreground px-2 py-1 rounded-md text-lg w-full font-semibold outline-none mb-2"
                          />
                        ) : (
                          <h3 className="text-lg font-bold mb-2 text-foreground truncate">
                            {p.name}
                          </h3>
                        )}
                        <div className="text-sm text-muted flex items-center gap-1.5">
                          <Clock size={12} /> Last edited{" "}
                          {timeAgo(p.lastModified || p.createdAt)}
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              background:
                                LANG_COLORS[p.lang] || LANG_COLORS["Default"],
                            }}
                          ></span>
                          {p.lang}
                        </div>
                        <div className="bg-card rounded-full px-2 py-1">
                          <Zap
                            size={12}
                            className="fill-amber-500 text-amber-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      <footer className="mt-auto border-t border-border/50 py-4 w-full text-center text-zinc-600 text-xs font-mono pointer-events-none relative z-10">
        HEXODE_SYSTEM_V3.0
      </footer>

      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create New Project</h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-muted hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={createProject} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted mb-1">
                    Project Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Awesome Algorithm"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted mb-3 font-medium">
                    Select Environment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      {
                        name: "JavaScript",
                        icon: <SiJavascript size={24} />,
                        color: "text-[#f1e05a]",
                      },
                      {
                        name: "Python",
                        icon: <SiPython size={24} />,
                        color: "text-[#3572A5]",
                      },
                      {
                        name: "Java",
                        icon: <FaJava size={24} />,
                        color: "text-[#b07219]",
                      },
                      {
                        name: "C++",
                        icon: <SiCplusplus size={24} />,
                        color: "text-[#f34b7d]",
                      },
                      {
                        name: "C",
                        icon: <SiC size={24} />,
                        color: "text-[#555599]",
                      },
                    ].map((lang) => (
                      <button
                        key={lang.name}
                        type="button"
                        onClick={() => setNewProjectLang(lang.name)}
                        className={`group flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${
                          newProjectLang === lang.name
                            ? "bg-blue-500/10 border-blue-500 text-foreground shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-[1.02]"
                            : "bg-surface border-transparent text-muted hover:bg-card hover:border-zinc-500 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`transition-all duration-300 ${
                            newProjectLang === lang.name
                              ? lang.color
                              : "text-muted opacity-70 group-hover:opacity-100 group-hover:scale-110"
                          }`}
                        >
                          {lang.icon}
                        </div>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg hover:bg-surface text-muted font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
