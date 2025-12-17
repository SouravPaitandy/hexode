import ReactGA from "react-ga4";

// Initialize Google Analytics
export const initGA = (measurementId) => {
  if (!measurementId) {
    console.warn("[Analytics] No measurement ID provided");
    return;
  }

  ReactGA.initialize(measurementId, {
    gaOptions: {
      anonymizeIp: true, // Privacy-friendly
    },
  });
};

// Track page views
export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track custom events
export const trackEvent = (category, action, label = null, value = null) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

// Specific event trackers
export const analytics = {
  // Project events
  projectCreated: (language) => {
    trackEvent("Project", "Created", language);
  },

  projectDeleted: () => {
    trackEvent("Project", "Deleted");
  },

  projectRenamed: () => {
    trackEvent("Project", "Renamed");
  },

  // Code execution events
  codeExecuted: (language) => {
    trackEvent("Code", "Executed", language);
  },

  // File events
  fileCreated: (extension) => {
    trackEvent("File", "Created", extension);
  },

  fileDeleted: () => {
    trackEvent("File", "Deleted");
  },

  // Collaboration events
  projectShared: () => {
    trackEvent("Collaboration", "Project Shared");
  },

  chatMessageSent: () => {
    trackEvent("Collaboration", "Chat Message Sent");
  },

  // Keyboard shortcuts
  keyboardShortcutUsed: (shortcut) => {
    trackEvent("UX", "Keyboard Shortcut", shortcut);
  },
};

export default analytics;
