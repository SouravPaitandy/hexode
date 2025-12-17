import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

const ProductTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps = [
    {
      title: "👋 Welcome to Hexode!",
      description:
        "Let's take a quick tour of your new coding workspace. You can skip anytime or use arrow keys to navigate.",
      highlight: null,
      position: { top: "25%", left: "35%", transform: "translate(-50%, -50%)" },
    },
    {
      title: "📁 File Explorer",
      description:
        "Create, rename, and organize your project files here. Click the + button to add new files and folders.",
      highlight: "sidebar",
      position: { top: "20%", left: "280px" },
    },
    {
      title: "✨ Code Editor",
      description:
        "Powered by Monaco (VS Code's editor). Features syntax highlighting, autocomplete, and multi-cursor editing.",
      highlight: "editor",
      position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    },
    {
      title: "▶️ Run Code",
      description:
        "Execute your code instantly with this button. Supports JavaScript, Python, Java, C, and C++.",
      highlight: "run-button",
      position: { top: "10%", right: "20%" },
    },
    {
      title: "💬 Chat & Collaboration",
      description:
        "Collaborate in real-time with your team! Use the chat to discuss code, share ideas, and work together seamlessly.",
      highlight: "chat",
      position: { top: "20%", right: "20%" },
    },
    {
      title: "🔗 Share Your Project",
      description:
        "Share your workspace with others! Click the share button to generate a link and collaborate with your team in real-time.",
      highlight: "share-button",
      position: { top: "20%", right: "20%" },
    },
    {
      title: "💻 Terminal & Output",
      description:
        "View output, errors, and interact with your running code. Switch between Terminal, Input, and Console tabs.",
      highlight: "terminal",
      position: { bottom: "35%", left: "50%", transform: "translateX(-50%)" },
    },
    {
      title: "⌨️ Pro Tips",
      description:
        "Press Ctrl+S (Cmd+S) to save manually, Ctrl+Enter (Cmd+Enter) to run code. Your work auto-saves every 2 seconds!",
      highlight: null,
      position: { top: "25%", left: "35%", transform: "translate(-50%, -50%)" },
    },
  ];

  useEffect(() => {
    const tourCompleted = localStorage.getItem("hexode-tour-completed");
    if (!tourCompleted) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("hexode-tour-completed", "true");
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const skipTour = () => {
    completeTour();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  // Get spotlight position based on highlight target
  const getSpotlightStyle = () => {
    if (!step.highlight) return null;

    const positions = {
      sidebar: {
        top: "50px",
        left: "0px",
        width: "260px",
        height: "500px",
      },
      editor: {
        top: "50px",
        left: "260px",
        right: "0px",
        bottom: "300px",
      },
      "run-button": {
        top: "5px",
        right: "60px",
        width: "100px",
        height: "35px",
      },
      chat: {
        top: "5px",
        right: "150px",
        width: "100px",
        height: "35px",
      },
      "share-button": {
        top: "5px",
        right: "275px",
        width: "100px",
        height: "35px",
      },
      terminal: {
        bottom: "20px",
        left: "260px",
        right: "0px",
        height: "240px",
      },
    };

    return positions[step.highlight];
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 dark:bg-black/40 bg-gray-200/40 z-9998"
            // onClick={skipTour}
          />

          {/* Spotlight Highlight */}
          {step.highlight && (
            <motion.div
              key={step.highlight}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed z-9998 pointer-events-none"
              style={getSpotlightStyle()}
            >
              <div className="absolute inset-0 border-4 border-blue-500 rounded-lg shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse" />
              <div className="absolute inset-0 bg-blue-500/10 rounded-lg" />
            </motion.div>
          )}

          {/* Tour Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-9999 bg-linear-to-br from-surface to-card border-2 border-blue-500 rounded-xl shadow-2xl p-6 max-w-md"
            style={step.position}
          >
            {/* Close Button */}
            <button
              onClick={skipTour}
              className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors"
              aria-label="Skip tour"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="mb-6 mt-2">
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted leading-relaxed text-sm">
                {step.description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2 mb-6 justify-center">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? "w-8 bg-blue-500"
                      : index < currentStep
                      ? "w-2 bg-green-500"
                      : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={skipTour}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-card border border-border hover:bg-surface text-foreground rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {currentStep === tourSteps.length - 1
                    ? "Get Started!"
                    : "Next"}
                  {currentStep < tourSteps.length - 1 && (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Keyboard Hint */}
            <div className="mt-4 text-xs text-muted text-center">
              Use arrow keys or Enter • Esc to skip
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductTour;
