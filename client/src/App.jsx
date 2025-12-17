import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initGA } from "./utils/analytics";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import IDE from "./pages/IDE";
import SplashScreen from "./components/SplashScreen";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initialize analytics (add your GA4 Measurement ID to .env)
    const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID) {
      initGA(GA_MEASUREMENT_ID);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:roomId" element={<IDE />} />
          {/* Fallback for direct link without ID */}
          <Route path="/editor" element={<IDE />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
