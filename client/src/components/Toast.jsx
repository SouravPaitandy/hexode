import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id; // Return ID so we can dismiss it manually if needed
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-9999 pointer-events-none">
        <AnimatePresence>
            {toasts.map(toast => (
            <motion.div 
                key={toast.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-surface text-foreground p-4 rounded-lg border border-border shadow-2xl flex items-center gap-3 min-w-[320px] text-sm pointer-events-auto"
            >
                {/* Icon based on type */}
                {toast.type === 'success' && <CheckCircle size={18} className="text-green-500" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-red-500" />}
                {toast.type === 'loading' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
                {toast.type === 'info' && <Info size={18} className="text-blue-500" />}

                <div className="flex-1 font-medium">{toast.message}</div>

                <button 
                    onClick={() => removeToast(toast.id)}
                    className="bg-transparent border-none cursor-pointer text-muted hover:text-foreground transition-colors"
                >
                    <X size={14} />
                </button>
            </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
