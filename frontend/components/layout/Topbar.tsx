"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  CheckCircle2,
  Database,
} from "lucide-react";
import { useChatStore } from "../../store/chatStore";

export const Topbar: React.FC = () => {
  const pathname = usePathname();
  const { documents, selectedDocumentId, selectDocument, fetchDocuments } =
    useChatStore();

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
    <header className="h-16 bg-surface-container border-b border-white/5 px-8 flex items-center justify-between select-none shrink-0 z-20">
      {/* Title section */}
      <div>
        <h1 className="text-md font-bold text-on-surface tracking-wide flex items-center gap-2">
          {title}
        </h1>
      </div>

      {/* Action panel & search */}
      <div className="flex items-center gap-6">
        {/* Global Active Document Select Dropdown */}
        {pathname?.startsWith("/chat") && (
          <div className="flex items-center gap-2 bg-[#171b26] px-3 py-1.5 rounded-md border border-white/5 text-xs text-on-surface-variant font-medium">
            <Database className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-on-surface-variant/40 uppercase font-mono mr-1">
              Active Context:
            </span>
            <select
              value={selectedDocumentId || ""}
              onChange={(e) => selectDocument(e.target.value || null)}
              className="bg-transparent text-on-surface border-none outline-none font-semibold cursor-pointer max-w-[160px] truncate"
            >
              {documents.length === 0 ? (
                <option value="">No Documents Available</option>
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

        {/* Search Mock Input */}
        <div className="relative w-64 hidden md:flex items-center">
          <Search className="w-4 h-4 text-on-surface-variant/40 absolute left-3" />
          <input
            type="text"
            placeholder="Search indexing indexes..."
            className="w-full py-1.5 pl-9 pr-3 rounded-md bg-surface-container-low border border-white/5 outline-none text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary/40 focus:bg-surface-container-high transition-all"
          />
        </div>

        {/* Database Health Badge */}
        <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20 text-[10px] font-semibold text-green-400 font-mono">
          <CheckCircle2 className="w-3 h-3 text-green-400" />
          DB OK
        </div>

        {/* Notifications and Settings */}
        <div className="relative cursor-pointer text-on-surface-variant/60 hover:text-on-surface transition-colors p-1">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
        </div>
      </div>
    </header>
  );
};
