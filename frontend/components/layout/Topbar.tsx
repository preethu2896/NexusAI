"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  CheckCircle2,
  Cpu,
  ChevronDown,
  Moon,
  Menu,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { toggleMobileDrawer } = useUIStore();

  const isDashboard = pathname?.startsWith("/dashboard");
  const isKnowledge = pathname?.startsWith("/knowledge");
  const isAgents = pathname?.startsWith("/agents");
  const isAnalytics = pathname?.startsWith("/analytics");

  // Dynamic configuration based on active page route to match PNG designs exactly
  let searchPlaceholder = "Search...";
  let showKbd = false;
  let statusIndicators: { label: string; healthy: boolean }[] = [];
  let rightDropdownText = "";

  if (isDashboard) {
    searchPlaceholder = "Search documents, conv...";
    showKbd = true;
    statusIndicators = [
      { label: "SYSTEM OPERATIONAL", healthy: true },
      { label: "AI READY", healthy: true },
      { label: "EMBEDDING ENGINE ONLINE", healthy: true },
    ];
    rightDropdownText = "GPT-4-Turbo";
  } else if (isAnalytics) {
    searchPlaceholder = "Search metrics...";
    statusIndicators = [
      { label: "POSTGRESQL ONLINE", healthy: true },
      { label: "CHROMADB ONLINE", healthy: true },
      { label: "OPENAI CONNECTED", healthy: true },
      { label: "STREAMING ENABLED", healthy: true },
    ];
    rightDropdownText = "TIMEFRAME: Last 30 Days";
  } else if (isKnowledge) {
    searchPlaceholder = "Search Knowledge Base...";
    // Knowledge Base topbar shows Search on left, and Workspace/Bell/Moon on right
    rightDropdownText = "Workspace";
  } else if (isAgents) {
    searchPlaceholder = "Search agents or capabilities...";
    statusIndicators = [
      { label: "POSTGRESQL ONLINE", healthy: true },
      { label: "CHROMADB ONLINE", healthy: true },
      { label: "OPENAI CONNECTED", healthy: true },
      { label: "STREAMING ENABLED", healthy: true },
    ];
    rightDropdownText = "Workspace";
  }

  return (
    <header className="h-16 bg-surface-container border-b border-white/5 px-4 md:px-6 flex items-center justify-between select-none shrink-0 z-20 transition-all duration-300">
      {/* Search Input on Left */}
      <div className="flex items-center gap-3 flex-1 max-w-sm md:max-w-md">
        <button
          onClick={toggleMobileDrawer}
          className="flex sm:hidden p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-on-surface focus:outline-none"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 text-on-surface-variant/40 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full py-2 pl-11 pr-16 rounded-default bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/30 focus:border-primary/30 focus:bg-surface-container-high transition-all"
            disabled
          />
          {showKbd && (
            <kbd className="absolute right-3.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[9px] font-semibold text-on-surface-variant/40 pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Mid Status Indicators */}
      {statusIndicators.length > 0 && (
        <div className="hidden xl:flex items-center gap-5 mx-4">
          {statusIndicators.map((ind) => (
            <div
              key={ind.label}
              className="flex items-center gap-1.5 text-[9px] font-bold font-mono tracking-wider text-on-surface-variant/65"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 block shrink-0" />
              <span>{ind.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Workspace or Model Selector Button */}
        {rightDropdownText && (
          <button className="flex items-center gap-2 bg-[#171b26] hover:bg-[#1c1f2a] px-3.5 py-1.5 rounded-default border border-white/5 text-xs text-on-surface font-semibold tracking-wide transition-all cursor-pointer">
            {isDashboard && <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />}
            <span>{rightDropdownText}</span>
            <ChevronDown className="w-3 h-3 text-on-surface-variant/60" />
          </button>
        )}

        {/* Workspace label (for non-dashboard top bars) */}
        {!isDashboard && !rightDropdownText && (
          <span className="hidden md:inline text-xs font-semibold text-on-surface-variant hover:text-on-surface cursor-pointer">
            Workspace
          </span>
        )}

        {/* Icons */}
        <div className="flex items-center gap-3 text-on-surface-variant/60">
          <div className="relative cursor-pointer hover:text-on-surface transition-colors p-1">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          </div>
          <div className="cursor-pointer hover:text-on-surface transition-colors p-1">
            <Moon className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
};
