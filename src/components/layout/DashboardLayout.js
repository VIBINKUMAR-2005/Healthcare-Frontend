import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    /*
     * app-shell applies the premium gradient canvas:
     *   radial cyan glow top-right  +  radial teal whisper bottom-left
     *   + linear slate→white→ice-cyan base
     * Cards remain pure white and float over it via shadow-card / shadow-card-stat.
     */
    <div className="app-shell">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content pane */}
        <main className="main-pane">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile overlay ─────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-20 lg:hidden
                     transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
