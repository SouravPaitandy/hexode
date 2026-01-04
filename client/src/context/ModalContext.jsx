import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X, Check, Trash2, Info } from "lucide-react";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "default", // default | danger | warning | success
    title: "",
    message: "",
    onConfirm: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
  });

  const confirm = useCallback(
    ({
      title = "Are you sure?",
      message = "This action cannot be undone.",
      type = "danger",
      confirmText = "Confirm",
      cancelText = "Cancel",
      onConfirm,
    }) => {
      setModalState({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        onConfirm,
      });
    },
    []
  );

  const close = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    close();
  };

  return (
    <ModalContext.Provider value={{ confirm, close }}>
      {children}
      <AnimatePresence>
        {modalState.isOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      modalState.type === "danger"
                        ? "bg-red-500/10 text-red-500"
                        : modalState.type === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : modalState.type === "success"
                        ? "bg-green-500/10 text-green-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {modalState.type === "danger" ? (
                      <Trash2 size={24} />
                    ) : modalState.type === "warning" ? (
                      <AlertTriangle size={24} />
                    ) : modalState.type === "success" ? (
                      <Check size={24} />
                    ) : (
                      <Info size={24} />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {modalState.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {modalState.message}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={close}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-card transition-colors"
                  >
                    {modalState.cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${
                      modalState.type === "danger"
                        ? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                    }`}
                  >
                    {modalState.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export default ModalContext;
