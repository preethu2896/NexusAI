"use client";

import React from "react";
import { motion } from "framer-motion";

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-1 bg-[#171b26] p-1 rounded-default border border-white/5 relative z-0 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-1.5 rounded-sm text-xs font-bold transition-colors cursor-pointer select-none focus:outline-none ${
              isActive ? "text-on-surface" : "text-on-surface-variant/40 hover:text-on-surface"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabOutline"
                className="absolute inset-0 bg-surface-container border border-white/5 rounded-sm -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
