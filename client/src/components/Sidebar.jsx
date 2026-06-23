import { useState, useMemo } from "react";
import {
  FileCode,
  FileJson,
  FileType,
  File,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  FolderPlus,
  FolderArchive,
  FileText,
} from "lucide-react";
import {
  SiCplusplus,
  SiJavascript,
  SiPython,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiJson,
  SiC,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { buildFileTree } from "../utils/fileSystem";
import { useToast } from "./Toast";

// Supported file extensions — must stay in sync with getLanguage() in IDE.jsx
const ALLOWED_EXTENSIONS = new Set([
  // JavaScript / TypeScript
  ".js",
  ".cjs",
  ".mjs",
  ".jsx",
  ".ts",
  ".tsx",
  // Python
  ".py",
  // Java / Kotlin
  ".java",
  ".kt",
  // C / C++
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  // Web
  ".html",
  ".css",
  // Data & Config
  ".json",
  // Plain text (exception)
  ".txt",
]);

/**
 * Returns true if the filename has an allowed extension.
 * Files with no extension at all are rejected.
 */
const isValidExtension = (name) => {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex <= 0) return false; // no extension, or starts with dot (e.g. ".keep")
  const ext = name.slice(dotIndex).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
};

// --- Recursive File Node ---
const FileNode = ({
  node,
  depth,
  activeFile,
  expandedFolders,
  toggleFolder,
  onSelect,
  onRename,
  onDelete,
  hoveredFile,
  setHoveredFile,
  editingFile,
  setEditingFile,
  editName,
  setEditName,
  handleRenameSubmit,
  isCreating,
  creationPath,
  setCreationPath,
  setIsCreating,
  newName,
  setNewName,
  handleCreateSubmit,
  isViewMode,
  isPlayground,
  totalFiles,
}) => {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = activeFile === node.path;

  // Icons
  const getFileIcon = (fileName) => {
    if (
      fileName.endsWith(".js") ||
      fileName.endsWith(".cjs") ||
      fileName.endsWith(".mjs") ||
      fileName.endsWith(".jsx")
    )
      return <SiJavascript size={16} className="text-yellow-400" />;
    if (fileName.endsWith(".ts") || fileName.endsWith(".tsx"))
      return <SiTypescript size={16} className="text-blue-500" />;
    if (fileName.endsWith(".py"))
      return <SiPython size={16} className="text-blue-400" />;
    if (fileName.endsWith(".java") || fileName.endsWith(".kt"))
      return <FaJava size={16} className="text-orange-500" />;
    if (fileName.endsWith(".cpp") || fileName.endsWith(".hpp"))
      return <SiCplusplus size={16} className="text-blue-600" />;
    if (fileName.endsWith(".c") || fileName.endsWith(".h"))
      return <SiC size={16} className="text-blue-600" />;
    if (fileName.endsWith(".css"))
      return <SiCss3 size={16} className="text-blue-400" />;
    if (fileName.endsWith(".html"))
      return <SiHtml5 size={16} className="text-orange-500" />;
    if (fileName.endsWith(".json"))
      return <SiJson size={16} className="text-yellow-200" />;
    if (fileName.endsWith(".txt"))
      return <FileText size={16} className="text-muted" />;
    return <File size={16} className="text-muted" />;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (node.type === "folder") {
      toggleFolder(node.path);
    } else if (node.name !== ".keep") {
      // .keep files are internal folder placeholders — never open them
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
        className={`relative flex items-center gap-1.5 py-1 pr-2 cursor-pointer transition-colors text-sm
                    ${
                      isSelected
                        ? "bg-card text-foreground border-l-2 border-blue-500"
                        : "text-muted border-l-2 border-transparent hover:bg-card hover:text-foreground"
                    }
                `}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={handleClick}
        onMouseEnter={() => setHoveredFile(node.path)}
        onMouseLeave={() => setHoveredFile(null)}
      >
        {/* Expand Arrow for Folders */}
        <span className="w-4 flex items-center justify-center shrink-0">
          {node.type === "folder" &&
            (isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            ))}
        </span>

        {/* File/Folder Icon */}
        <span className="shrink-0">
          {node.type === "folder" ? (
            isExpanded ? (
              <FolderOpen size={14} className="text-blue-400" />
            ) : (
              <Folder size={14} className="text-blue-400" />
            )
          ) : (
            getFileIcon(node.name)
          )}
        </span>

        {/* Name or Edit Input */}
        <div className="flex-1 overflow-hidden">
          {editingFile === node.path ? (
            <form
              onSubmit={handleRenameSubmit}
              onClick={(e) => e.stopPropagation()}
            >
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
        {hoveredFile === node.path &&
          editingFile !== node.path &&
          !isViewMode && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-surface/90 backdrop-blur-sm p-1 rounded shadow-sm">
              {node.type === "folder" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCreating("file");
                      setCreationPath(node.path);
                      if (!expandedFolders.has(node.path))
                        toggleFolder(node.path);
                    }}
                    className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                    title="New File Inside"
                  >
                    <Plus size={12} />
                  </button>
                  {!isPlayground && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreating("folder");
                        setCreationPath(node.path);
                        if (!expandedFolders.has(node.path))
                          toggleFolder(node.path);
                      }}
                      className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                      title="New Folder Inside"
                    >
                      <FolderPlus size={12} />
                    </button>
                  )}
                </>
              )}
              <button
                onClick={startRenaming}
                className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground p-0.5"
                title="Rename"
              >
                <Edit2 size={12} />
              </button>
              {/* {totalFiles > 1 && ( */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.path);
                }}
                className="bg-transparent border-none cursor-pointer text-muted hover:text-red-400 p-0.5"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
              {/* )} */}
            </div>
          )}
      </div>

      {/* Children (Recursive) */}
      {node.type === "folder" && isExpanded && (
        <div>
          {/* Inline Creation Input */}
          {isCreating && creationPath === node.path && (
            <div className="pl-3 py-1">
              <div
                className="flex items-center gap-1.5"
                style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}
              >
                {isCreating === "folder" ? (
                  <Folder size={14} className="text-blue-400" />
                ) : (
                  <File size={14} className="text-muted" />
                )}
                <form onSubmit={handleCreateSubmit} className="flex-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder={
                      isCreating === "folder"
                        ? "folder name"
                        : "e.g. main.js, Main.java, script.py"
                    }
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsCreating(false);
                        setNewName("");
                      }
                    }}
                    onBlur={() => {
                      setIsCreating(false);
                      setNewName("");
                    }}
                    className="w-full bg-card border border-blue-500 text-foreground px-1.5 py-0.5 rounded-sm outline-none text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                </form>
              </div>
            </div>
          )}

          {node.children &&
            node.children
              .filter((child) => child.name !== ".keep") // hide internal folder-placeholder files
              .map((child) => (
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
                  isPlayground={isPlayground}
                  totalFiles={totalFiles}
                />
              ))}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({
  files,
  activeFile,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  isViewMode,
  isPlayground,
}) => {
  const { addToast } = useToast();
  const [isCreating, setIsCreating] = useState(false); // false | 'file' | 'folder'
  const [creationPath, setCreationPath] = useState(""); // where to create
  const [newName, setNewName] = useState("");

  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [hoveredFile, setHoveredFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editName, setEditName] = useState("");

  const tree = useMemo(() => buildFileTree(files), [files]);
  const totalFiles = useMemo(
    () => Object.keys(files || {}).filter((f) => !f.endsWith(".keep")).length,
    [files],
  );

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const MAX_FILES_PER_PROJECT = 15;
    if (totalFiles >= MAX_FILES_PER_PROJECT) {
      addToast(
        `Open-source limit reached (${MAX_FILES_PER_PROJECT} files/project). Please sponsor us to increase capacity!`,
        "error",
        8000,
      );
      setIsCreating(false);
      setNewName("");
      return;
    }

    // Validate extension for files (folders use .keep internally, skip check)
    if (isCreating === "file" && !isValidExtension(trimmed)) {
      const dotIndex = trimmed.lastIndexOf(".");
      const hint =
        dotIndex <= 0
          ? "Please include a file extension (e.g. main.js, script.py)."
          : `".${trimmed.slice(dotIndex + 1)}" is not a supported extension.`;
      addToast(
        `${hint} Allowed: .js .jsx .ts .tsx .py .java .kt .c .cpp .h .html .css .json .txt`,
        "error",
        10000,
      );
      return; // Keep input open so user can correct
    }

    const fullPath = creationPath ? `${creationPath}/${trimmed}` : trimmed;

    // Folders get a hidden .keep placeholder to anchor them in the Yjs map
    const finalPath = isCreating === "folder" ? `${fullPath}/.keep` : fullPath;

    onCreate(finalPath);
    setNewName("");
    setIsCreating(false);

    // Auto expand parent folder after creation
    if (creationPath) {
      setExpandedFolders((prev) => new Set(prev).add(creationPath));
    }
  };

  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (editName.trim() && editName !== editingFile) {
      const trimmedEdit = editName.trim();
      const hasDot = trimmedEdit.includes(".");

      // Only validate extension if the new name has a dot (i.e. it looks like a file).
      // Folder renames (no dot) are always allowed.
      if (hasDot && !isValidExtension(trimmedEdit)) {
        addToast(
          `Cannot rename to "${trimmedEdit}" — unsupported extension. Allowed: .js .jsx .ts .tsx .py .java .kt .c .cpp .h .html .css .json .txt`,
          "error",
          6000,
        );
        setEditingFile(null);
        return;
      }

      const pathParts = editingFile.split("/");
      pathParts.pop(); // remove old name
      const parentPath = pathParts.join("/");
      const newPath = parentPath ? `${parentPath}/${trimmedEdit}` : trimmedEdit;

      onRename(editingFile, newPath);
    }
    setEditingFile(null);
  };

  return (
    <div className="w-full h-full glass-panel border-y-0 border-l-0 flex flex-col text-muted select-none">
      <div className="px-4 py-3 text-xs font-bold uppercase tracking-widest flex justify-between items-center text-muted border-b border-border">
        <span className="flex items-center gap-1.5">
          <FolderArchive size={14} /> EXPLORER
        </span>
        {!isViewMode && (
          <div className="flex gap-1">
            <button
              onClick={() => {
                setIsCreating("file");
                setCreationPath("");
              }}
              className="text-muted cursor-pointer hover:text-foreground hover:bg-card p-1 rounded transition-colors"
              title="New File"
            >
              <Plus size={14} />
            </button>
            {!isPlayground && (
              <button
                onClick={() => {
                  setIsCreating("folder");
                  setCreationPath("");
                }}
                className="text-muted cursor-pointer hover:text-foreground hover:bg-card p-1 rounded transition-colors"
                title="New Folder"
              >
                <FolderPlus size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-2">
        {/* Creation Input at Root */}
        {isCreating && !creationPath && (
          <div className="px-4 py-1 pb-2">
            <form
              onSubmit={handleCreateSubmit}
              className="flex items-center gap-1.5"
            >
              {isCreating === "folder" ? (
                <Folder size={14} className="text-blue-400" />
              ) : (
                <File size={14} className="text-muted" />
              )}
              <input
                autoFocus
                type="text"
                placeholder={
                  isCreating === "folder"
                    ? "folder name"
                    : "e.g. main.js, Main.java, script.py"
                }
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsCreating(false);
                    setNewName("");
                  }
                }}
                onBlur={() => {
                  setIsCreating(false);
                  setNewName("");
                }}
                className="w-full bg-surface border border-blue-500 text-foreground px-1.5 py-0.5 rounded-sm outline-none text-xs"
              />
            </form>
          </div>
        )}

        {tree.length === 0 && !isCreating && (
          <div className="text-center text-xs text-zinc-600 mt-4 italic">
            Empty Project
          </div>
        )}

        {tree
          .filter((node) => node.name !== ".keep") // root-level .keep files hidden
          .map((node) => (
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
              isPlayground={isPlayground}
              totalFiles={totalFiles}
            />
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
