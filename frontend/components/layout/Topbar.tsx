"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  CheckCircle2,
  Database,
  Menu,
  X,
} from "lucide-react";
import { useChatStore } from "../../store/chatStore";
import { useUIStore } from "../../store/uiStore";

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { documents, selectedDocumentId, selectDocument, fetchDocuments } =
    useChatStore();
  const { isMobileDrawerOpen, toggleMobileDrawer } = useUIStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Determine active section title
  let title = "Dashboard";
  if (pathname?.startsWith("/knowledge")) title = "Knowledge Base";
  else if (pathname?.startsWith("/agents")) title = "AI Agents Console";
  else if (pathname?.startsWith("/analytics")) title = "Performance & Analytics";
  else if (pathname?.startsWith("/chat")) title = "Stateful AI Chat Assistant";

  return (
    <header className="h-16 bg-surface-container border-b border-white/5 px-4 md:px-8 flex items-center justify-between select-none shrink-0 z-20 transition-all duration-300">
      {/* Title & Hamburger button */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={toggleMobileDrawer}
          className="flex sm:hidden items-center justify-center p-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-on-surface cursor-pointer focus:outline-none"
          title="Toggle Navigation Menu"
        >
          {isMobileDrawerOpen ? (
            <X className="w-4 h-4 text-on-surface" />
          ) : (
            <Menu className="w-4 h-4 text-on-surface" />
          )}
        </button>
        <h1 className="text-sm font-bold text-on-surface tracking-wide flex items-center gap-2 truncate">
          {title}
        </h1>
      </div>

      {/* Action panel & search */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Global Active Document Select Dropdown */}
        {pathname?.startsWith("/chat") && (
          <div className="flex items-center gap-1 bg-[#171b26] px-2 py-1 md:px-3 md:py-1.5 rounded-default border border-white/5 text-xs text-on-surface-variant font-medium">
            <Database className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary shrink-0" />
            <span className="hidden lg:inline text-[9px] text-on-surface-variant/40 uppercase font-mono mr-1">
              Active Context:
            </span>
            <select
              value={selectedDocumentId || ""}
              onChange={(e) => selectDocument(e.target.value || null)}
              className="bg-transparent text-on-surface border-none outline-none font-semibold cursor-pointer max-w-[120px] md:max-w-[160px] truncate text-[10px] md:text-xs"
            >
              {documents.length === 0 ? (
                <option value="">No Documents</option>
              ) : (
                documents.map((doc) => (
                  <option
                    key={doc.document_id}
                    value={doc.document_id}
                    className="bg-[#1c1f2a] text-on-surface"
                  >
                    {doc.title || doc.filename}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Search Mock Input (Hidden on Mobile, responsive width) */}
        <div className="relative w-40 lg:w-64 hidden sm:flex items-center">
          <Search className="w-3.5 h-3.5 text-on-surface-variant/40 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full py-1.5 pl-9 pr-3 rounded-default bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:bg-surface-container-high transition-all"
          />
        </div>

        {/* Database Health Badge */}
        <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full border border-green-500/20 text-[9px] md:text-[10px] font-semibold text-green-400 font-mono">
          <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-green-400" />
          <span className="hidden xs:inline">DB OK</span>
        </div>

        {/* Notifications */}
        <div className="relative cursor-pointer text-on-surface-variant/60 hover:text-on-surface transition-colors p-1 shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </header>
  );
};
