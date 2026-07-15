"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Database,
  FolderHeart,
  Bot,
  BarChart3,
  Settings,
  Plus,
  Network,
  Cpu,
  Layers,
  CircleUser,
} from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, setMobileDrawerOpen } = useUIStore();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
    { name: "Documents", href: "/knowledge", icon: FileText },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "Collections", href: "/knowledge", icon: FolderHeart },
    { name: "Agents", href: "/agents", icon: Bot },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard", icon: Settings },
  ];

  // Contextual items based on active page route to match PNG designs exactly
  const isDashboard = pathname?.startsWith("/dashboard");
  const isKnowledge = pathname?.startsWith("/knowledge");
  const isAgents = pathname?.startsWith("/agents");
  const isAnalytics = pathname?.startsWith("/analytics");

  // Determine button label and position
  // Dashboard shows "+ New Workspace" at bottom.
  // Knowledge Base shows "+ New Agent" at the top of navigation.
  // Agents and Analytics show "+ New Agent" / "New Agent" at the bottom of navigation.
  const showTopButton = isKnowledge;
  const showBottomButton = isDashboard || isAgents || isAnalytics;
  const bottomButtonLabel = isDashboard ? "New Workspace" : "New Agent";

  // Determine user profile content based on page mockups
  let userProfileName = "Alex Rivera";
  let userProfileRole = "Workspace Admin";
  if (isKnowledge || isAnalytics) {
    userProfileName = "Alex Chen";
    userProfileRole = isAnalytics ? "ADMIN" : "Workspace Owner";
  }

  return (
    <aside
      className={`bg-surface-container-low border-r border-white/5 flex flex-col h-screen select-none shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Workspace Header Brand */}
      <div className="h-16 border-b border-white/5 px-5 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
            <Network className="w-4 h-4 text-primary" />
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <span className="font-bold text-sm text-on-surface block tracking-wide">
                NexusAI
              </span>
              <span className="text-[10px] text-on-surface-variant/40 block -mt-1 font-semibold uppercase tracking-wider">
                Enterprise
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {/* "+ New Agent" button placed at the top for Knowledge Base page mockup */}
        {!isSidebarCollapsed && showTopButton && (
          <div className="px-4 mb-3">
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary hover:bg-[#9cbbf5] text-on-primary font-semibold text-xs rounded-default transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>New Agent</span>
            </button>
          </div>
        )}

        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href) && (
              (item.name === "Dashboard" && isDashboard) ||
              (item.name === "AI Chat" && pathname === "/chat") ||
              (item.name === "Knowledge Base" && isKnowledge) ||
              (item.name === "Agents" && isAgents) ||
              (item.name === "Analytics" && isAnalytics) ||
              (item.name === "Documents" && item.href === pathname) ||
              (item.name === "Collections" && item.href === pathname) ||
              (item.name === "Settings" && item.href === pathname)
            );
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
                    className={`w-12 h-10 rounded-default flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5"
                    }`}
                    title={item.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    className={`w-full py-2.5 px-4 rounded-default flex items-center justify-start text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[rgba(99,102,241,0.85)] text-white shadow-sm"
                        : "text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Middle/Bottom Action Button if applicable */}
      {!isSidebarCollapsed && showBottomButton && (
        <div className="px-4 mb-4 shrink-0">
          <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#adc6ff] hover:bg-[#9cbbf5] text-[#002e6a] font-bold text-xs rounded-default transition-all duration-150 shadow-sm active:scale-[0.98] cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>{bottomButtonLabel}</span>
          </button>
        </div>
      )}

      {/* Dynamic Profile and Workspace Indicator */}
      <div className="p-4 border-t border-white/5 bg-surface-container-lowest/40 flex flex-col gap-3 shrink-0 overflow-hidden">
        {/* Additional Workspace links shown in Knowledge/Agents/Analytics mockups */}
        {!isSidebarCollapsed && (isKnowledge || isAgents || isAnalytics) && (
          <div className="space-y-2 text-[11px] font-semibold text-on-surface-variant/50 px-1 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 hover:text-on-surface cursor-pointer">
              <Layers className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </div>
            {isKnowledge && (
              <div className="flex items-center gap-2 hover:text-on-surface cursor-pointer">
                <Cpu className="w-3.5 h-3.5" />
                <span>GPT-4o-Turbo</span>
              </div>
            )}
            {isAgents && (
              <div className="flex items-center gap-2 hover:text-on-surface cursor-pointer">
                <Bot className="w-3.5 h-3.5" />
                <span>Current Model</span>
              </div>
            )}
          </div>
        )}

        {/* Profile Details */}
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <CircleUser className="w-5 h-5 text-on-surface-variant" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden min-w-0">
                <span className="text-xs font-bold text-on-surface block truncate">
                  {userProfileName}
                </span>
                <span className="text-[9px] text-on-surface-variant/40 block truncate font-mono uppercase tracking-wider mt-0.5">
                  {userProfileRole}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
