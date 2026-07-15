"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Layers,
  Cpu,
  BarChart3,
  Settings,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Search,
  Grid,
  Star,
  Pin,
  FolderOpen,
  Dot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/uiStore";
import { useToastStore } from "../../store/toastStore";
import { Dropdown } from "../ui/Dropdown";
import { Dialog } from "../ui/Dialog";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebarCollapse, setMobileDrawerOpen } = useUIStore();
  const { addToast } = useToastStore();
  
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // Listen to keyboard shortcuts (⌘K/Ctrl+K for command palette, ⌘/ for collapse)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapse]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "Collections", href: "/collections", icon: Layers },
    { name: "Agents", href: "/agents", icon: Cpu },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Workspaces mock data
  const workspaces = [
    { id: "nexus-ent", label: "Nexus Enterprise" },
    { id: "personal", label: "Personal Space" },
    { id: "marketing", label: "Marketing AI Docs" },
  ];
  const [activeWorkspace, setActiveWorkspace] = useState(workspaces[0]);

  const workspaceDropdownItems = workspaces.map((ws) => ({
    id: ws.id,
    label: ws.label,
    onClick: () => {
      setActiveWorkspace(ws);
      addToast(`Switched to workspace: ${ws.label}`, "info");
    },
  }));

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    addToast(`Switched to ${nextTheme} mode (Visual mockup)`, "info");
  };

  const handleLogout = () => {
    addToast("Logged out of session", "warning");
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  // Command palette items mock
  const cmdItems = [
    { title: "Go to Dashboard", href: "/dashboard", cat: "Navigation" },
    { title: "Start a New Chat", href: "/chat", cat: "Navigation" },
    { title: "Upload Reference document", href: "/knowledge", cat: "Actions" },
    { title: "View Analytics Operations", href: "/analytics", cat: "Navigation" },
    { title: "Manage Agent Marketplace", href: "/agents", cat: "Navigation" },
    { title: "Configure LLM Providers", href: "/settings", cat: "Settings" },
  ];
  const filteredCmdItems = cmdItems.filter((i) =>
    i.title.toLowerCase().includes(cmdQuery.toLowerCase())
  );

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0f131d] border-r border-white/5 flex flex-col h-screen select-none shrink-0 z-30 relative overflow-hidden"
    >
      {/* Workspace Switcher */}
      <div className="h-14 border-b border-white/5 px-4 flex items-center justify-between shrink-0">
        <Dropdown
          align="left"
          trigger={
            <button className="flex items-center gap-2.5 text-left p-1 rounded hover:bg-white/5 transition-all text-on-surface cursor-pointer w-full select-none focus:outline-none">
              <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Grid className="w-3.5 h-3.5 text-primary" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-grow min-w-0 flex items-center justify-between pr-1">
                  <div className="truncate">
                    <span className="font-bold text-xs text-on-surface block tracking-wide truncate">
                      {activeWorkspace.label}
                    </span>
                    <span className="text-[8px] text-on-surface-variant/45 block truncate font-mono uppercase tracking-wider mt-0.5">
                      v2.4 Stable
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-on-surface-variant/40 shrink-0 ml-1.5" />
                </div>
              )}
            </button>
          }
          items={workspaceDropdownItems}
          className="w-full"
        />
      </div>

      {/* Sidebar Search Command Trigger */}
      <div className="px-4 py-3 shrink-0">
        {isSidebarCollapsed ? (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-10 h-10 rounded bg-[#171b26] border border-white/5 hover:border-white/10 text-on-surface-variant/40 hover:text-on-surface flex items-center justify-center transition-all cursor-pointer focus:outline-none"
            title="Search Workspace (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center gap-2.5 py-1.5 px-3 bg-[#171b26] border border-white/5 hover:border-white/10 text-[11px] text-on-surface-variant/40 hover:text-on-surface rounded text-left transition-all cursor-pointer select-none focus:outline-none"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-grow">Search dashboard...</span>
            <kbd className="px-1.5 py-0.2 rounded border border-white/10 bg-white/5 text-[9px] font-semibold text-on-surface-variant/30">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-4 py-2">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="no-underline block"
                onClick={() => setMobileDrawerOpen(false)}
              >
                {isSidebarCollapsed ? (
                  <button
                    className={`w-10 h-10 rounded flex items-center justify-center transition-all duration-150 mx-auto cursor-pointer focus:outline-none ${
                      isActive
                        ? "bg-[#1c2438] text-primary border border-primary/10"
                        : "text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5"
                    }`}
                    title={item.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    className={`w-full py-2 px-3 rounded flex items-center justify-start text-[11px] font-semibold tracking-wide transition-all duration-150 cursor-pointer focus:outline-none ${
                      isActive
                        ? "bg-[#1c2438] text-primary border border-primary/10 shadow-sm font-bold relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary"
                        : "text-on-surface-variant/70 hover:text-on-surface hover:bg-white/3"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-2.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Favorites & Pinned Sections (Show only when expanded) */}
        {!isSidebarCollapsed && (
          <div className="space-y-4 pt-4 border-t border-white/5 select-none">
            {/* Favorites */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-3 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-[#d0bcff]" /> Favorites
              </span>
              <div className="space-y-0.5">
                <Link href="/chat" className="no-underline block">
                  <button className="w-full py-1.5 px-3 rounded text-[11px] text-on-surface-variant/60 hover:text-on-surface hover:bg-white/3 text-left truncate flex items-center gap-2 cursor-pointer focus:outline-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                    <span className="truncate">Production RAG Model</span>
                  </button>
                </Link>
                <Link href="/agents" className="no-underline block">
                  <button className="w-full py-1.5 px-3 rounded text-[11px] text-on-surface-variant/60 hover:text-on-surface hover:bg-white/3 text-left truncate flex items-center gap-2 cursor-pointer focus:outline-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#d0bcff]" />
                    <span className="truncate">Planner Orchestrator</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Pinned Collections */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/35 uppercase px-3 flex items-center gap-1.5">
                <Pin className="w-3 h-3 text-primary" /> Pinned
              </span>
              <div className="space-y-0.5">
                <Link href="/collections" className="no-underline block">
                  <button className="w-full py-1.5 px-3 rounded text-[11px] text-on-surface-variant/60 hover:text-on-surface hover:bg-white/3 text-left truncate flex items-center gap-2 cursor-pointer focus:outline-none">
                    <FolderOpen className="w-3 h-3 text-on-surface-variant/30" />
                    <span className="truncate">Legal NDA Audits</span>
                  </button>
                </Link>
                <Link href="/collections" className="no-underline block">
                  <button className="w-full py-1.5 px-3 rounded text-[11px] text-on-surface-variant/60 hover:text-on-surface hover:bg-white/3 text-left truncate flex items-center gap-2 cursor-pointer focus:outline-none">
                    <FolderOpen className="w-3 h-3 text-on-surface-variant/30" />
                    <span className="truncate">SOC2 Compliance specs</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-white/5 bg-surface-container-lowest/30 flex flex-col gap-3 shrink-0">
        {/* User profile row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-primary shrink-0 select-none">
              AR
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-on-surface block truncate leading-tight">
                  Alex Rivera
                </span>
                <span className="text-[8px] text-on-surface-variant/40 block truncate font-mono uppercase tracking-wider mt-0.5">
                  Platform Admin
                </span>
              </div>
            )}
          </div>
          
          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-white/5 text-on-surface-variant/40 hover:text-error transition-all cursor-pointer focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Toolbar */}
        {!isSidebarCollapsed && (
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5 text-on-surface-variant/40">
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => addToast("No new notifications", "info")}
                className="p-1.5 rounded hover:bg-white/5 hover:text-on-surface transition-all cursor-pointer focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1.5 w-1 h-1 bg-primary rounded-full" />
              </button>
            </div>

            <button
              onClick={toggleSidebarCollapse}
              className="px-2 py-0.5 rounded border border-white/5 hover:border-white/10 bg-white/3 text-[8px] font-mono hover:text-on-surface transition-all cursor-pointer focus:outline-none"
              title="Collapse (⌘/)"
            >
              Collapse
            </button>
          </div>
        )}

        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebarCollapse}
            className="w-10 h-6 rounded border border-white/5 hover:border-white/10 bg-white/3 text-[8px] font-mono text-on-surface-variant/60 hover:text-on-surface flex items-center justify-center transition-all mx-auto cursor-pointer focus:outline-none"
            title="Expand (⌘/)"
          >
            Expand
          </button>
        )}
      </div>

      {/* Command Palette search modal */}
      <Dialog
        isOpen={isCommandPaletteOpen}
        onClose={() => {
          setIsCommandPaletteOpen(false);
          setCmdQuery("");
        }}
        title="Command Palette Search"
      >
        <div className="space-y-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-on-surface-variant/30 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Search shortcuts, pages, resources..."
              className="w-full py-2 pl-10 pr-4 rounded bg-surface-container-low border border-white/10 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/40 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
            <span className="text-[9px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase block mb-1">
              Results
            </span>
            {filteredCmdItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-on-surface-variant/30 font-mono">
                No matching results found
              </div>
            ) : (
              filteredCmdItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    router.push(item.href);
                    setIsCommandPaletteOpen(false);
                    setCmdQuery("");
                    addToast(`Navigated to ${item.title}`, "success");
                  }}
                  className="p-2 rounded hover:bg-white/3 cursor-pointer flex items-center justify-between border border-transparent hover:border-white/5 transition-all"
                >
                  <span className="text-xs font-semibold text-on-surface">
                    {item.title}
                  </span>
                  <span className="text-[9px] font-mono text-on-surface-variant/30 px-1.5 py-0.5 rounded border border-white/10 bg-white/3">
                    {item.cat}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Dialog>
    </motion.aside>
  );
};
