import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  FolderOpen, 
  Cpu, 
  LineChart, 
  Settings,
  Search,
  CheckCircle,
  Command,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
  currentUser: { username: string; email: string; fullName: string } | null;
  onSignOut: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onSearchClick, currentUser, onSignOut }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'agents', label: 'Agents', icon: Cpu },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = currentUser ? getInitials(currentUser.fullName) : 'AK';
  const userFullName = currentUser ? currentUser.fullName : 'Alex Karev';
  const userEmail = currentUser ? currentUser.email : 'acme.enterprise.ai';

  return (
    <aside id="main-sidebar" className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0 z-20">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-start">
        <img 
          src="/logo.png" 
          alt="NexusAI Enterprise" 
          className="h-11 w-auto object-contain" 
        />
      </div>

      {/* Global Command Search Bar */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
          <input
            id="sidebar-search-bar"
            type="text"
            placeholder="Search..."
            readOnly
            onClick={onSearchClick}
            className="w-full bg-slate-50/70 border border-slate-200/60 rounded-lg pl-8.5 pr-8 py-1.5 text-xs font-sans text-slate-600 focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
            <Command className="w-2.5 h-2.5 text-slate-400" />
            <span className="font-sans text-[9px] text-slate-400 font-bold">K</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <span className="px-5 font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">WORKSPACE</span>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left ${
                isActive 
                  ? 'bg-blue-50 text-[#2563EB] font-bold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400'
              }`} />
              <span className="font-sans text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom status and profile panels */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/30 space-y-3">
        {/* Systems Operational Panel */}
        <div className="bg-[#EEF2F6]/60 border border-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block shrink-0" />
            <span className="font-sans text-xs font-bold text-slate-800">All systems operational</span>
          </div>
          <span className="font-sans text-[10px] text-slate-500 block mt-0.5 leading-tight">
            Retrieval p95: 214ms · 3 agents active
          </span>
        </div>

        {/* User Account Panel */}
        <div className="flex items-center justify-between gap-2 p-1 rounded-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-sans font-bold text-white text-xs shrink-0 shadow-sm uppercase">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-bold text-slate-800 truncate leading-none">{userFullName}</p>
              <p className="font-sans text-[10px] text-slate-400 truncate mt-1 leading-none">{userEmail}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onSignOut}
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors shrink-0"
            title="Sign Out of Workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
