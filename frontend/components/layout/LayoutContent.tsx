"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useUIStore } from "../../store/uiStore";
import { ToastContainer } from "../ui/Toast";

export const LayoutContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";

  const {
    isSidebarCollapsed,
    isMobileDrawerOpen,
    setSidebarCollapsed,
    setMobileDrawerOpen,
  } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setSidebarCollapsed(true);
        // Keep mobile drawer closed on initial resize triggers
      } else if (width >= 640 && width <= 1024) {
        setSidebarCollapsed(true);
        setMobileDrawerOpen(false);
      } else {
        setSidebarCollapsed(false);
        setMobileDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed, setMobileDrawerOpen]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen bg-surface text-on-surface">
        <div className="w-64 bg-surface-container-low border-r border-white/5" />
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          <div className="h-16 bg-surface-container border-b border-white/5" />
          <main className="flex-grow bg-surface p-8 overflow-y-auto" />
        </div>
      </div>
    );
  }

  if (isChatPage) {
    return (
      <div className="h-full w-full bg-surface text-on-surface overflow-hidden relative">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-surface text-on-surface overflow-hidden relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden transition-opacity duration-300"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 transform sm:translate-x-0 sm:relative shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full sm:transform-none"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Viewport Container */}
      <div className="flex-grow flex flex-col h-full min-w-0 overflow-hidden relative">
        <Topbar />

        <main className="flex-grow overflow-y-auto custom-scrollbar bg-surface p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
