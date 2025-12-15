/**
 * Builds a tree structure from a list of file paths.
 * @param {string[]} files - List of file paths (e.g., ["index.js", "src/App.js"])
 * @returns {Array} - Tree structure
 */
export const buildFileTree = (files) => {
    const root = [];
  
    files.forEach((path) => {
      const parts = path.split('/');
      let currentLevel = root;
  
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const existingNode = currentLevel.find((node) => node.name === part);
  
        if (existingNode) {
          if (isFile) {
             // It's a file, but we might have treated it as a folder before? 
             // In this simple model, leaf is file.
          } else {
             currentLevel = existingNode.children;
          }
        } else {
          const newNode = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
          };
          
          currentLevel.push(newNode);
          if (!isFile) {
            currentLevel = newNode.children;
          }
        }
      });
    });
  
    return sortTree(root);
  };
  
  const sortTree = (nodes) => {
    return nodes.sort((a, b) => {
        // Folders first
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        // Then alphabetic
        return a.name.localeCompare(b.name);
    }).map(node => {
        if (node.children) {
            node.children = sortTree(node.children);
        }
        return node;
    });
  };
