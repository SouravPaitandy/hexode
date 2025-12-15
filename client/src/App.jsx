import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import IDE from './pages/IDE';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:roomId" element={<IDE />} />
        {/* Fallback for direct link without ID */}
        <Route path="/editor" element={<IDE />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
