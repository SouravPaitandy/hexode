import React from 'react';

const StatusBar = ({ fileCount, username, fileName }) => {
  return (
    <div className="h-6 bg-blue-600 text-white flex items-center px-4 text-xs justify-between font-medium select-none">
    <div className="flex gap-4">
        <span className="flex items-center gap-1.5">🌱 {fileCount} Files</span>
        <span className="flex items-center gap-1.5">👤 {username}</span>
    </div>
    <div className="flex gap-4">
        <span>{fileName.endsWith('py') ? 'Python 3.10' : fileName.endsWith('.java') ? 'Java 15' : fileName.endsWith('.cpp') ? 'C++ 10.2' : fileName.endsWith('.js') ? 'Node 18' : fileName.endsWith('.c') ? 'C 10.2' : 'Unknown'}</span>
        <span>UTF-8</span>
        <span>Connected</span>
    </div>
    </div>
  );
};

export default StatusBar;
