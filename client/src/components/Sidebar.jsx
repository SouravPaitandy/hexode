import { useState, useMemo } from 'react';
import { FileCode, FileJson, FileType, File, Plus, Trash2, Edit2, ChevronDown, ChevronRight, FolderOpen, Folder, FolderPlus } from 'lucide-react';
import { buildFileTree } from '../utils/fileSystem';

// --- Recursive File Node ---
const FileNode = ({ node, depth, activeFile, expandedFolders, toggleFolder, onSelect, onRename, onDelete, hoveredFile, setHoveredFile, editingFile, setEditingFile, editName, setEditName, handleRenameSubmit, isCreating, creationPath, setCreationPath, setIsCreating, newName, setNewName, handleCreateSubmit, isViewMode }) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = activeFile === node.path;
    
    // Icons
    const getFileIcon = (fileName) => {
        if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return <FileCode size={14} className="text-yellow-400" />; 
        if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return <FileCode size={14} className="text-blue-400" />; 
        if (fileName.endsWith('.py')) return <FileCode size={14} className="text-blue-300" />; 
        if (fileName.endsWith('.java')) return <FileCode size={14} className="text-orange-400" />; 
        if (fileName.endsWith('.cpp') || fileName.endsWith('.c')) return <FileCode size={14} className="text-blue-600" />;
        if (fileName.endsWith('.css')) return <FileType size={14} className="text-sky-400" />;
        if (fileName.endsWith('.html')) return <FileCode size={14} className="text-orange-500" />;
        if (fileName.endsWith('.json')) return <FileJson size={14} className="text-yellow-200" />;
        return <File size={14} className="text-muted" />;
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            toggleFolder(node.path);
        } else {
            onSelect(node.path);
        }
    };

    const startRenaming = (e) => {
        e.stopPropagation();
        setEditingFile(node.path);
        setEditName(node.name);
    };

    return (
        <div>
            <div 
                className={`flex items-center gap-1.5 py-1 pr-2 cursor-pointer transition-colors text-sm
                    ${isSelected ? "bg-card text-foreground border-l-2 border-blue-500" : "text-muted border-l-2 border-transparent hover:bg-card hover:text-foreground"}
                `}
                style={{ paddingLeft: `${depth * 12 + 12}px` }}
                onClick={handleClick}
                onMouseEnter={() => setHoveredFile(node.path)}
                onMouseLeave={() => setHoveredFile(null)}
            >
                {/* Expand Arrow for Folders */}
                <span className="w-4 flex items-center justify-center shrink-0">
                    {node.type === 'folder' && (
                        isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                    )}
                </span>

                {/* File/Folder Icon */}
                <span className="shrink-0">
                    {node.type === 'folder' 
                        ? (isExpanded ? <FolderOpen size={14} className="text-blue-400" /> : <Folder size={14} className="text-blue-400" />)
                        : getFileIcon(node.name)
                    }
                </span>

                {/* Name or Edit Input */}
                <div className="flex-1 overflow-hidden">
                    {editingFile === node.path ? (
                        <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                            <input 
                                autoFocus
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={handleRenameSubmit}
                                className="w-full bg-surface border border-blue-500 text-foreground px-1 py-0.5 rounded-sm outline-none text-xs"
                            />
                        </form>
                    ) : (
                        <span className="truncate block">{node.name}</span>
                    )}
                </div>

                {/* Actions */}
                {hoveredFile === node.path && editingFile !== node.path && !isViewMode && (
                    <div className="flex gap-1 shrink-0 bg-transparent pl-2">
                        {node.type === 'folder' && (
                             <>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setIsCreating('file'); 
                                        setCreationPath(node.path); 
                                        if (!expandedFolders.has(node.path)) toggleFolder(node.path);
                                    }} 
                                    className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                                    title="New File Inside"
                                >
                                    <Plus size={12} />
                                </button>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setIsCreating('folder'); 
                                        setCreationPath(node.path); 
                                        if (!expandedFolders.has(node.path)) toggleFolder(node.path);
                                    }} 
                                    className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                                    title="New Folder Inside"
                                >
                                    <FolderPlus size={12} />
                                </button>
                             </>
                        )}
                         <button 
                            onClick={startRenaming} 
                            className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                            title="Rename"
                        >
                            <Edit2 size={12} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(node.path); }}
                            className="bg-transparent border-none cursor-pointer text-muted hover:text-red-400 p-0.5"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                )}
            </div>

            {/* Children (Recursive) */}
            {node.type === 'folder' && isExpanded && (
                <div>
                     {/* Inline Creation Input */}
                     {isCreating && creationPath === node.path && (
                         <div className="pl-3 py-1">
                             <div className="flex items-center gap-1.5" style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}>
                                {isCreating === 'folder' ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-muted" />}
                                <form onSubmit={handleCreateSubmit} className="flex-1">
                                    <input 
                                        autoFocus
                                        type="text" 
                                        placeholder={isCreating === 'folder' ? "folder name" : "filename.js"}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setIsCreating(false);
                                                setNewName("");
                                            }
                                        }}
                                        onBlur={() => { setIsCreating(false); setNewName(""); }} 
                                        className="w-full bg-card border border-blue-500 text-foreground px-1.5 py-0.5 rounded-sm outline-none text-xs"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </form>
                            </div>
                         </div>
                     )}

                    {node.children && node.children.map(child => (
                        <FileNode 
                            key={child.path} 
                            node={child} 
                            depth={depth + 1}
                            activeFile={activeFile}
                            expandedFolders={expandedFolders}
                            toggleFolder={toggleFolder}
                            onSelect={onSelect}
                            onRename={onRename}
                            onDelete={onDelete}
                            hoveredFile={hoveredFile}
                            setHoveredFile={setHoveredFile}
                            editingFile={editingFile}
                            setEditingFile={setEditingFile}
                            editName={editName}
                            setEditName={setEditName}
                            handleRenameSubmit={handleRenameSubmit}
                            isCreating={isCreating}
                            creationPath={creationPath}
                            setCreationPath={setCreationPath}
                            setIsCreating={setIsCreating}
                            newName={newName}
                            setNewName={setNewName}
                            handleCreateSubmit={handleCreateSubmit}
                            isViewMode={isViewMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


const Sidebar = ({ files, activeFile, onSelect, onCreate, onDelete, onRename, isViewMode }) => {
  const [isCreating, setIsCreating] = useState(false); // false | 'file' | 'folder'
  const [creationPath, setCreationPath] = useState(""); // where to create
  const [newName, setNewName] = useState("");
  
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [hoveredFile, setHoveredFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState("");

  const tree = useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = (path) => {
      setExpandedFolders(prev => {
          const next = new Set(prev);
          if (next.has(path)) next.delete(path);
          else next.add(path);
          return next;
      });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      // If creating folder, append slash (optional logic, but here we just pass path)
      // Actually sidebar passes path. IDE.jsx should handle if it is a folder or just a filename.
      // But Yjs map doesn't strictly have folder objects. We create a placeholder file or just implied.
      // Simplest: Just create empty file for now? User asked for recursive system.
      // Let's assume creating a file at root or path.
      
      const fullPath = creationPath ? `${creationPath}/${newName.trim()}` : newName.trim();
      
      // If mode is 'folder', maybe create a .keep file?
      const finalPath = isCreating === 'folder' ? `${fullPath}/.keep` : fullPath;
      
      onCreate(finalPath);
      setNewName("");
      setIsCreating(false);
      
      // Auto expand parent
      if (creationPath) {
          setExpandedFolders(prev => new Set(prev).add(creationPath));
      }
    }
  };

  const handleRenameSubmit = (e) => {
      e.preventDefault();
      if (editName.trim() && editName !== editingFile) {
          // Check if it's a full path rename or just name
          // We need to keep the parent path
          const pathParts = editingFile.split('/');
          pathParts.pop(); // remove old name
          const parentPath = pathParts.join('/');
          const newPath = parentPath ? `${parentPath}/${editName.trim()}` : editName.trim();
          
          onRename(editingFile, newPath);
      }
      setEditingFile(null);
  };

  return (
    <div className="w-full h-full bg-surface border-r border-border flex flex-col text-muted select-none">
      <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest flex justify-between items-center text-muted bg-surface border-b border-border">
        <span className="flex items-center gap-1.5"><ChevronDown size={14} /> EXPLORER</span>
        {!isViewMode && (
            <div className="flex gap-1">
                <button 
                    onClick={() => { setIsCreating('file'); setCreationPath(""); }}
                    className="text-muted hover:text-foreground hover:bg-card p-1 rounded transition-colors"
                    title="New File"
                >
                    <Plus size={14} />
                </button>
                <button 
                    onClick={() => { setIsCreating('folder'); setCreationPath(""); }}
                    className="text-muted hover:text-foreground hover:bg-card p-1 rounded transition-colors"
                    title="New Folder"
                >
                    <FolderPlus size={14} />
                </button>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-2">
        {/* Creation Input at Root */}
        {isCreating && !creationPath && (
             <div className="px-4 py-1 pb-2">
                <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5">
                    {isCreating === 'folder' ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-muted" />}
                    <input 
                        autoFocus
                        type="text" 
                        placeholder={isCreating === 'folder' ? "folder name" : "filename.js"}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setIsCreating(false);
                                setNewName("");
                            }
                        }}
                        onBlur={() => { setIsCreating(false); setNewName(""); }} 
                        className="w-full bg-surface border border-blue-500 text-foreground px-1.5 py-0.5 rounded-sm outline-none text-xs"
                    />
                </form>
            </div>
        )}

        {tree.length === 0 && !isCreating && (
            <div className="text-center text-xs text-zinc-600 mt-4 italic">Empty Project</div>
        )}

        {tree.map(node => (
            <FileNode 
                key={node.path}
                node={node}
                depth={0}
                activeFile={activeFile}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                hoveredFile={hoveredFile}
                setHoveredFile={setHoveredFile}
                editingFile={editingFile}
                setEditingFile={setEditingFile}
                editName={editName}
                setEditName={setEditName}
                handleRenameSubmit={handleRenameSubmit}
                
                isCreating={isCreating}
                creationPath={creationPath}
                setCreationPath={setCreationPath}
                setIsCreating={setIsCreating}
                newName={newName}
                setNewName={setNewName}
                handleCreateSubmit={handleCreateSubmit}
                isViewMode={isViewMode}
            />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
