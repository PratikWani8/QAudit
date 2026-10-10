import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { useWebSocket } from "../contexts/WebSocketContext";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const RootLayout: React.FC = () => {
  const { latestAlert, clearAlerts } = useWebSocket();

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      <Navbar />

      {/* Real-time Security Alert Banner */}
      <AnimatePresence>
        {latestAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-950/80 border-b border-rose-500/40 text-rose-200 px-4 py-2 text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2 max-w-5xl">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
              <span className="font-semibold uppercase tracking-wider font-mono">
                [REAL-TIME SECURITY ALERT]:
              </span>
              <span>
                {latestAlert.type} — {JSON.stringify(latestAlert.data)}
              </span>
            </div>
            <button
              onClick={clearAlerts}
              className="p-1 hover:bg-rose-900/50 rounded text-rose-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
