"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Bot,
  BarChart3,
  MessageSquare,
  Sparkles,
  Layers,
  User,
  Settings,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useUIStore } from "../../store/uiStore";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarCollapsed, isMobileDrawerOpen, setMobileDrawerOpen } = useUIStore();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Knowledge Base", href: "/knowledge", icon: Database },
    { name: "AI Agents", href: "/agents", icon: Bot },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "AI Chat", href: "/chat", icon: MessageSquare },
  ];

  return (
    <aside
      className={`bg-surface-container-low border-r border-white/5 flex flex-col h-screen select-none shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isSidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Workspace Switcher Header */}
      <div className="h-16 border-b border-white/5 px-4 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-primary-container/20 flex items-center justify-center border border-primary/20 text-primary shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <span className="font-bold text-sm text-on-surface block tracking-wide">
                NexusAI
              </span>
              <span className="text-[9px] text-on-surface-variant/40 block -mt-1 font-mono uppercase tracking-widest">
                MVP-PLATFORM
              </span>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
            <Layers className="w-3.5 h-3.5 text-on-surface-variant" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {!isSidebarCollapsed && (
          <span className="px-5 text-[10px] font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase mb-2 block truncate">
            Core Engine
          </span>
        )}
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
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
                        ? "bg-white/5 text-primary border-l-2 border-primary rounded-l-none"
                        : "text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5"
                    }`}
                    title={item.name}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
                  </button>
                ) : (
                  <Button variant="nav" isActive={isActive}>
                    <Icon
                      className={`w-4 h-4 mr-2 ${
                        isActive ? "text-primary" : "text-on-surface-variant/60"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Button>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User / Org Bottom Profile */}
      <div className="p-4 border-t border-white/5 bg-surface-container-lowest/40 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
            <User className="w-4 h-4 text-on-surface-variant" />
          </div>
          {!isSidebarCollapsed && (
            <div className="overflow-hidden min-w-0">
              <span className="text-xs font-semibold text-on-surface block truncate">
                Default Developer
              </span>
              <span className="text-[10px] text-on-surface-variant/50 block truncate font-mono">
                default@nexusai.dev
              </span>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="text-on-surface-variant/40 hover:text-on-surface cursor-pointer p-1 rounded hover:bg-white/5 transition-all shrink-0">
            <Settings className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
