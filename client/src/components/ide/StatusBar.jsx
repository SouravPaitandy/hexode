import React from "react";
import { Files, User } from "lucide-react";

const StatusBar = ({ fileCount, username, fileName, isConnected }) => {
  return (
    <div className="h-6 bg-blue-600 text-white flex items-center px-4 text-xs justify-between font-medium select-none">
      <div className="flex gap-4">
        <span className="flex items-center gap-1.5">
          <Files size={11} /> {fileCount} Files
        </span>
        <span className="flex items-center gap-1.5">
          <User size={11} /> {username}
        </span>
      </div>
      <div className="flex gap-4">
        <span>
          {!fileName || fileName === "" || fileName === "Untitled"
            ? "No File"
            : fileName.endsWith("py")
              ? "Python 3.10"
              : fileName.endsWith(".java")
                ? "Java 15"
                : fileName.endsWith(".cpp")
                  ? "C++ 10.2"
                  : fileName.endsWith(".js") ||
                      fileName.endsWith(".cjs") ||
                      fileName.endsWith(".mjs")
                    ? "Node 18"
                    : fileName.endsWith(".c")
                      ? "C 10.2"
                      : "Unknown"}
        </span>
        <span>UTF-8</span>
        {/* <span className={isConnected ? "text-green-300" : "text-red-300"}>
          {isConnected ? "● Connected" : "● Offline"}
        </span> */}
      </div>
    </div>
  );
};

export default StatusBar;
