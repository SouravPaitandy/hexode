import { useState } from 'react';
import { FileCode, FileJson, FileType, File, Plus, Trash2, Edit2, Check } from 'lucide-react';

const Sidebar = ({ files, activeFile, onSelect, onCreate, onDelete, onRename }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  
  // Renaming State
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState("");
  const [hoveredFile, setHoveredFile] = useState(null);

  const handleCreate = (e) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreate(newFileName.trim());
      setNewFileName("");
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = (e) => {
      e.preventDefault();
      if (editName.trim() && editName !== editingFile) {
          onRename(editingFile, editName.trim());
      }
      setEditingFile(null);
  }

  const startRenaming = (e, fileName) => {
      e.stopPropagation();
      setEditingFile(fileName);
      setEditName(fileName);
  }

  const getFileIcon = (fileName) => {
      if (fileName.endsWith('.js')) return <FileCode size={16} color="#f7df1e" />; 
      if (fileName.endsWith('.py')) return <FileCode size={16} color="#3776ab" />; 
      if (fileName.endsWith('.java')) return <FileCode size={16} color="#b07219" />; 
      if (fileName.endsWith('.cpp') || fileName.endsWith('.c')) return <FileCode size={16} color="#00599c" />;
      if (fileName.endsWith('.css')) return <FileType size={16} color="#264de4" />;
      if (fileName.endsWith('.html')) return <FileCode size={16} color="#e34c26" />;
      if (fileName.endsWith('.json')) return <FileJson size={16} color="#cbcb41" />;
      return <File size={16} color="#ccc" />;
  };

  return (
    <div style={{ width: "250px", flexShrink: 0, background: "#16161a", borderRight: "1px solid #222", display: "flex", flexDirection: "column", color: "#8892b0" }}>
      <div style={{ padding: "15px", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>💾 Explorer</span>
        <button 
            onClick={() => setIsCreating(true)}
            style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "4px" }}
            title="New File"
        >
            <Plus size={18} />
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} style={{ padding: "10px" }}>
            <input 
                autoFocus
                type="text" 
                placeholder="filename.js" 
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => setIsCreating(false)} // Cancel on click away
                style={{ width: "100%", background: "#0f0f12", border: "1px solid #007acc", color: "white", padding: "6px 10px", borderRadius: "4px", outline: "none", fontSize: "0.9rem" }}
            />
        </form>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingTop: "5px" }}>
        {files.map((fileName) => (
            <div 
                key={fileName}
                onMouseEnter={() => setHoveredFile(fileName)}
                onMouseLeave={() => setHoveredFile(null)}
                onClick={() => onSelect(fileName)}
                style={{ 
                    padding: "8px 15px", 
                    cursor: "pointer", 
                    background: activeFile === fileName ? "#222" : "transparent", 
                    color: activeFile === fileName ? "#fff" : "#8892b0", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    gap: "8px",
                    borderLeft: activeFile === fileName ? "3px solid #007acc" : "3px solid transparent",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, overflow: "hidden" }}>
                    {getFileIcon(fileName)}
                    {editingFile === fileName ? (
                         <form onSubmit={handleRenameSubmit} style={{ flex: 1 }}>
                            <input 
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleRenameSubmit}
                                onClick={(e) => e.stopPropagation()}
                                style={{ width: "100%", background: "#0f0f12", border: "1px solid #007acc", color: "white", padding: "2px 4px", borderRadius: "2px", outline: "none", fontSize: "0.9rem" }}
                            />
                         </form>
                    ) : (
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName}</span>
                    )}
                </div>

                {/* Actions (Only show on hover and not editing) */}
                {hoveredFile === fileName && editingFile !== fileName && (
                    <div style={{ display: "flex", gap: "5px" }}>
                        <button 
                            onClick={(e) => startRenaming(e, fileName)} 
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#8892b0", padding: "2px" }}
                            title="Rename"
                        >
                            <Edit2 size={14} className="hover-icon" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(fileName); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#8892b0", padding: "2px" }}
                            title="Delete"
                        >
                            <Trash2 size={14} className="hover-icon" />
                        </button>
                    </div>
                )}
            </div>
        ))}
      </div>
      <style>{`
        .hover-icon:hover { color: white !important; }
      `}</style>
    </div>
  );
};

export default Sidebar;
