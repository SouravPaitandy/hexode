import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Folder, Clock, MoreVertical, Trash2, Code, Edit2, Check } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // Demo Data
  const DEMO_PROJECTS = [
    { id: "demo-python", name: "Python Algorithms", lang: "Python", createdAt: new Date().toISOString(), time: "Demo" },
    { id: "demo-java", name: "Java Backend Service", lang: "Java", createdAt: new Date().toISOString(), time: "Demo" },
    { id: "demo-cpp", name: "C++ Game Engine", lang: "C++", createdAt: new Date().toISOString(), time: "Demo" },
  ];

  // Load Projects from LocalStorage (with Seeding Logic)
  useEffect(() => {
    const saved = localStorage.getItem('devdock-projects');
    const hasSeeded = localStorage.getItem('devdock-demos-v1');
    
    let loadedProjects = [];
    if (saved) {
      loadedProjects = JSON.parse(saved);
    }

    if (!hasSeeded) {
      // First time seeding demos (even if other projects exist)
      // Filter out demos if they already exist to avoid dups (paranoid check)
      const existingIds = new Set(loadedProjects.map(p => p.id));
      const demosToAdd = DEMO_PROJECTS.filter(d => !existingIds.has(d.id));
      
      loadedProjects = [...loadedProjects, ...demosToAdd];
      
      localStorage.setItem('devdock-projects', JSON.stringify(loadedProjects));
      localStorage.setItem('devdock-demos-v1', 'true');
    }

    // Sort by Date
    setProjects(loadedProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }, []);

  const handleNewProject = () => {
    const id = "proj-" + Math.floor(Math.random() * 10000);
    const newProject = {
      id,
      name: `Untitled Project ${Math.floor(Math.random() * 100)}`,
      lang: "JavaScript",
      createdAt: new Date().toISOString(),
      time: "Just now"
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('devdock-projects', JSON.stringify(updated));
    
    navigate(`/editor/${id}`);
  };

  const deleteProject = (e, id) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('devdock-projects', JSON.stringify(updated));
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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

  return (
    <div style={{ background: "#0f0f12", minHeight: "100vh", color: "white", fontFamily: "'Inter', sans-serif" }}>
       {/* Header */}
      <div style={{ position: "fixed", top: "0", left: "0", right: "0", zIndex: "1000", padding: "20px 50px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#16161a" }}>
        <div style={{ fontSize: "1.4rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "12px", color: "#e0e0e0" }}>
            <div style={{ background: "#007acc", padding: "8px", borderRadius: "8px", display: "flex" }}>
                <Code size={24} color="white" />
            </div>
            DevDock Dashboard
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             <Link to="/" style={{ textDecoration: "none", color: "#8892b0", fontSize: "0.9rem", fontWeight: "600" }}>Home</Link>
             <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #007acc, #00d4ff)", border: "2px solid #222" }}></div>
        </div>
      </div>

      <div style={{ padding: "100px 50px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Welcome */}
        <div style={{ marginBottom: "50px", display: "flex", justifyContent: "space-between", alignItems: "end", borderBottom: "1px solid #222", paddingBottom: "30px" }}>
            <div>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "15px" }}><span style={{ background: "linear-gradient(90deg, #fff, #8892b0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} >Welcome back, Coder! </span>👋</h1>
                <p style={{ color: "#8892b0", fontSize: "1.1rem" }}>Pick up where you left off or start building something new.</p>
            </div>
            <button 
                onClick={handleNewProject}
                style={{ 
                    display: "flex", alignItems: "center", gap: "10px", padding: "14px 28px", 
                    background: "#007acc", color: "white", border: "none", borderRadius: "8px", 
                    cursor: "pointer", fontWeight: "600", fontSize: "1rem", boxShadow: "0 4px 15px rgba(0, 122, 204, 0.3)",
                    transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
                <Plus size={20} /> New Project
            </button>
        </div>

        {/* Projects Grid */}
        <h2 style={{ fontSize: "1.2rem", marginBottom: "25px", color: "#ccc", display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={18} /> Recent Projects
        </h2>

        {projects.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", background: "#16161a", borderRadius: "15px", border: "1px dashed #333", color: "#666" }}>
                <Folder size={48} style={{ marginBottom: "15px", opacity: 0.5 }} />
                <p style={{ fontSize: "1.1rem" }}>No projects yet. Create one to get started!</p>
            </div>
        ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
                <AnimatePresence>
                    {projects.map((p) => (
                        <motion.div 
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                        >
                            <Link to={`/editor/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <motion.div 
                                    whileHover={{ y: -5, borderColor: "#007acc", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                                    style={{ 
                                        padding: "25px", background: "#16161a", borderRadius: "12px", 
                                        border: "1px solid #222", position: "relative",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "flex-start" }}>
                                        <div style={{ background: "rgba(0, 122, 204, 0.1)", padding: "10px", borderRadius: "8px" }}>
                                            <Folder size={24} color="#007acc" />
                                        </div>
                                        <div style={{ display: "flex" }}>
                                            <button 
                                                onClick={(e) => startEditing(e, p)}
                                                style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", padding: "5px" }}
                                                title="Rename Project"
                                            >
                                                <Edit2 size={16} className="action-icon" />
                                            </button>
                                            <button 
                                                onClick={(e) => deleteProject(e, p.id)}
                                                style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", padding: "5px" }}
                                                title="Delete Project"
                                            >
                                                <Trash2 size={16} className="trash-icon" />
                                            </button>
                                        </div>
                                    </div>

                                    {editingId === p.id ? (
                                        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center" }}>
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onClick={(e) => e.preventDefault()}
                                                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(e); }}
                                                onBlur={saveEdit}
                                                style={{ 
                                                    background: "#0f0f12", border: "1px solid #007acc", color: "white", 
                                                    padding: "4px 8px", borderRadius: "4px", fontSize: "1.1rem", width: "100%", fontWeight: "600"
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px", color: "#e0e0e0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h3>
                                    )}

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#666", marginTop: "15px" }}>
                                        <span style={{ background: "#222", padding: "4px 8px", borderRadius: "4px" }}>{p.lang}</span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>{p.time === "Just now" ? "Just now" : formatDate(p.createdAt)}</span>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>
      <style>{`
        .trash-icon:hover { color: #ff4444 !important; }
        .action-icon:hover { color: #007acc !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;
