import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Clock, MoreVertical, Trash2, Code, Edit2, Check, Layout, Search, Zap } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const LANG_COLORS = { "Python": "#3572A5", "JavaScript": "#f1e05a", "Java": "#b07219", "C++": "#f34b7d", "Default": "#ccc" };

  // Demo Data
  const DEMO_PROJECTS = [
    { id: "demo-python", name: "Python Algorithms", lang: "Python", createdAt: new Date(Date.now() - 100000000).toISOString() },
    { id: "demo-java", name: "Java Backend Service", lang: "Java", createdAt: new Date(Date.now() - 200000000).toISOString() },
    { id: "demo-cpp", name: "C++ Game Engine", lang: "C++", createdAt: new Date(Date.now() - 300000000).toISOString() },
  ];

  const { user, isSignedIn } = useUser();
  
  // Load Projects (Hybrid: Local + DB)
  useEffect(() => {
    const loadProjects = async () => {
        // 1. Load Local
        const saved = localStorage.getItem('devdock-projects');
        let local = saved ? JSON.parse(saved) : [];
        
        // Seeding for new users (Local only)
        if (!localStorage.getItem('devdock-demos-v1') && local.length === 0) {
             local = [...DEMO_PROJECTS];
             localStorage.setItem('devdock-projects', JSON.stringify(local));
             localStorage.setItem('devdock-demos-v1', 'true');
        }

        if (isSignedIn) {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                // 1b. Sync User to DB
                // Use env var or default to localhost
                await axios.post(`${API_URL}/api/users/sync`, {
                    clerkId: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    name: user.fullName || user.firstName
                });

                // 2. Sync Local -> DB (Once)
                if (local.length > 0) {
                    await Promise.all(local.map(p => 
                        axios.post(`${API_URL}/api/rooms`, { 
                            roomId: p.id, 
                            ownerId: user.id,
                            name: p.name,
                            lang: p.lang
                        })
                    ));
                    localStorage.removeItem('devdock-projects'); // Clear local after sync
                    local = [];
                }

                // 3. Fetch from DB
                // 3. Fetch from DB
                const res = await axios.get(`${API_URL}/api/rooms?ownerId=${user.id}`);
                setProjects(res.data);
            } catch (err) {
                console.error("Failed to fetch/sync projects", err);
            }
        } else {
            setProjects(local);
        }
    };
    if (isSignedIn && user?.id) { // Only run if auth is ready
        loadProjects();
    } else if (!isSignedIn) {
        loadProjects();
    }
  }, [isSignedIn, user?.id]); // Depend on user.id to ensure it's loaded

  const handleNewProject = async () => {
    const id = "proj-" + Math.floor(Math.random() * 100000);
    const newProject = {
      id,
      roomId: id, // Consistency
      name: `Untitled Project`,
      lang: "JavaScript",
      createdAt: new Date().toISOString()
    };

    if (isSignedIn) {
        // Save to DB
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await axios.post(`${API_URL}/api/rooms`, {
                roomId: id,
                ownerId: user.id,
                name: newProject.name,
                lang: newProject.lang
            });
            setProjects([newProject, ...projects]); // Optimistic update
        } catch (err) { console.error(err); }
    } else {
        // Save to Local
        const updated = [newProject, ...projects];
        setProjects(updated);
        localStorage.setItem('devdock-projects', JSON.stringify(updated));
    }
    navigate(`/editor/${id}`);
  };

  const deleteProject = (e, id) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        localStorage.setItem('devdock-projects', JSON.stringify(updated));
    }
  };

  const startEditing = (e, p) => {
    e.preventDefault();
    setEditingId(p.id);
    setEditName(p.name);
  };

  const saveEdit = (e) => {
    e.preventDefault(); 
    if (!editingId) return;

    const updated = projects.map(p => p.id === editingId ? { ...p, name: editName } : p);
    setProjects(updated);
    localStorage.setItem('devdock-projects', JSON.stringify(updated));
    setEditingId(null);
  };

  const filteredProjects = projects.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-b border-border flex justify-between items-center bg-surface/80 backdrop-blur-md">
        <div className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <div className="bg-linear-to-br from-blue-600 to-cyan-400 p-2 rounded-xl flex shadow-lg shadow-blue-500/30">
                <Code size={22} color="white" />
            </div>
            Hexode
        </div>
        <div className="flex gap-5 items-center">
             <div className="hidden md:block relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-foreground focus:outline-none focus:border-primary text-sm w-64 transition-colors placeholder:text-muted"
                 />
             </div>
             <div className="h-6 w-px bg-border"></div>
             <ThemeToggle />
             {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
             ) : (
                <SignInButton mode="modal">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20">
                        Sign In
                    </button>
                </SignInButton>
             )}
        </div>
      </div>

      <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Welcome */}
        <div className="mb-12 flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-extrabold mb-2 text-foreground">Dashboard</h1>
                <p className="text-muted text-lg">Manage your projects and deployments.</p>
            </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12">
            
            {/* New Project Card */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewProject}
                className="group border-2 border-dashed border-border rounded-2xl bg-transparent flex flex-col justify-center items-center cursor-pointer text-muted min-h-[200px] transition-all hover:bg-blue-500/5 hover:border-blue-500 hover:text-foreground"
            >
                <div className="bg-card p-4 rounded-full mb-4 group-hover:bg-blue-500/20">
                    <Plus size={24} className="text-blue-500" />
                </div>
                <span className="font-semibold text-base">Create New Project</span>
            </motion.button>

            <AnimatePresence>
                {filteredProjects.map((p) => (
                    <motion.div 
                        key={p.roomId || p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        layout
                    >
                        <Link to={`/editor/${p.roomId || p.id}`} className="block h-full no-underline text-inherit">
                            <motion.div 
                                whileHover={{ y: -6 }}
                                className="p-6 bg-surface rounded-2xl border border-border h-full flex flex-col justify-between hover:shadow-2xl hover:border-zinc-500 transition-all group"
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
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => deleteProject(e, p.id)}
                                                className="p-1.5 rounded-md text-muted hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {editingId === p.id ? (
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onClick={(e) => e.preventDefault()}
                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(e); }}
                                            onBlur={saveEdit}
                                            className="bg-background border border-blue-500 text-foreground px-2 py-1 rounded-md text-lg w-full font-semibold outline-none mb-2"
                                        />
                                    ) : (
                                        <h3 className="text-lg font-bold mb-2 text-foreground truncate">{p.name}</h3>
                                    )}
                                    <div className="text-sm text-muted flex items-center gap-1.5">
                                        <Clock size={12} /> Last edited {timeAgo(p.createdAt)}
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                                        <span className="w-2 h-2 rounded-full" style={{ background: LANG_COLORS[p.lang] || LANG_COLORS["Default"] }}></span>
                                        {p.lang}
                                    </div>
                                    <div className="bg-card rounded-full px-2 py-1">
                                        <Zap size={12} className="fill-amber-500 text-amber-500" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
