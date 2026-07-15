"use client";

import React, { useState } from "react";
import {
  Settings,
  Layers,
  Cpu,
  Database,
  Lock,
  Sliders,
  Bell,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Keyboard,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useToastStore } from "../../store/toastStore";

export default function SettingsPage() {
  const { addToast } = useToastStore();
  const [activeSection, setActiveSection] = useState("workspace");

  // Key visibility toggles
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);

  // Forms state
  const [workspaceName, setWorkspaceName] = useState("Nexus Enterprise");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-....................");
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-....................");
  const [chromaUrl, setChromaUrl] = useState("http://localhost:8000");

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    addToast("Settings configuration saved successfully", "success");
  };

  const handleResetVectorStore = () => {
    if (
      confirm(
        "WARNING: This will completely delete all document chunks and semantic vectors in ChromaDB! This action is irreversible. Proceed?"
      )
    ) {
      addToast("ChromaDB vector store cleared successfully", "warning");
    }
  };

  const sections = [
    { id: "workspace", label: "Workspace Details", icon: Layers },
    { id: "providers", label: "AI Providers & Keys", icon: Cpu },
    { id: "database", label: "Vector Database", icon: Database },
    { id: "preferences", label: "Preferences & Shortcuts", icon: Sliders },
    { id: "danger", label: "Danger Zone", icon: Trash2 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 pb-12 select-none items-start">
      {/* 1. Left Navigation panel */}
      <div className="w-full lg:w-56 shrink-0 space-y-1">
        <h2 className="text-xs font-bold font-mono tracking-widest text-on-surface-variant/40 uppercase px-4 mb-4 select-none">
          Settings Console
        </h2>
        {sections.map((sec) => {
          const isActive = sec.id === activeSection;
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-3 py-2.5 px-4 rounded text-[11px] font-semibold tracking-wide transition-all cursor-pointer text-left focus:outline-none ${
                isActive
                  ? "bg-[#1c2438] text-primary border border-primary/10"
                  : "text-on-surface-variant/70 hover:text-on-surface hover:bg-white/3"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Center Configuration form panel */}
      <div className="flex-grow w-full lg:max-w-xl">
        <Card variant="surface" className="p-5 border border-white/5">
          <form onSubmit={handleSaveConfig} className="space-y-6">
            {/* Workspace section */}
            {activeSection === "workspace" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body-sm font-bold text-on-surface">Workspace Settings</h3>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">
                    Configure your enterprise workspace parameters and naming.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
                    Workspace Name
                  </label>
                  <Input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
                    Workspace ID
                  </label>
                  <div className="p-2.5 rounded bg-surface-container-low border border-white/5 font-mono text-xs text-on-surface-variant/70">
                    nexusai-workspace-enterprise-v2
                  </div>
                </div>

                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            )}

            {/* Providers and Keys section */}
            {activeSection === "providers" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body-sm font-bold text-on-surface">AI Providers & API Keys</h3>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">
                    Add keys for model providers. Access keys are stored securely.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* OpenAI key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 flex items-center justify-between">
                      <span>OpenAI API Key</span>
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="text-[9px] hover:text-on-surface text-primary font-bold font-mono focus:outline-none cursor-pointer"
                      >
                        {showOpenAIKey ? "Hide" : "Show"}
                      </button>
                    </label>
                    <Input
                      type={showOpenAIKey ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  {/* Anthropic key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 flex items-center justify-between">
                      <span>Anthropic API Key</span>
                      <button
                        type="button"
                        onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                        className="text-[9px] hover:text-on-surface text-primary font-bold font-mono focus:outline-none cursor-pointer"
                      >
                        {showAnthropicKey ? "Hide" : "Show"}
                      </button>
                    </label>
                    <Input
                      type={showAnthropicKey ? "text" : "password"}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary">
                  Save Access Keys
                </Button>
              </div>
            )}

            {/* Vector DB section */}
            {activeSection === "database" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body-sm font-bold text-on-surface">Vector Database configuration</h3>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">
                    Manage reference server connection endpoints for vector search indexing.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold font-mono uppercase text-on-surface-variant/60 block">
                    ChromaDB server URL
                  </label>
                  <Input
                    type="text"
                    value={chromaUrl}
                    onChange={(e) => setChromaUrl(e.target.value)}
                    required
                    className="font-mono text-xs"
                  />
                </div>

                <div className="p-3 bg-[#0f2e1a] border border-green-500/20 rounded flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                  <div>
                    <span className="text-[10px] font-bold text-green-400 block leading-none">ChromaDB Online</span>
                    <span className="text-[8px] text-green-400/60 block mt-1">Connection verified successfully.</span>
                  </div>
                </div>

                <Button type="submit" variant="primary">
                  Verify Connection
                </Button>
              </div>
            )}

            {/* Preferences & Keyboard shortcuts */}
            {activeSection === "preferences" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-body-sm font-bold text-on-surface">Preferences & System Theme</h3>
                    <p className="text-[10px] text-on-surface-variant/50 mt-1">
                      Customize notifications and themes defaults.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded border border-white/5 bg-surface-container-low/40">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-on-surface block">Dynamic citations popup</span>
                      <span className="text-[9px] text-on-surface-variant/40 block">Show chunk details inside chats interface automatically.</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </div>
                </div>

                {/* Keyboard shortcuts list */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div>
                    <h3 className="text-body-sm font-bold text-[#d0bcff] flex items-center gap-1.5 leading-none">
                      <Keyboard className="w-4 h-4 text-[#d0bcff]" />
                      System Hotkeys
                    </h3>
                    <p className="text-[10px] text-on-surface-variant/50 mt-1">
                      Raycast-style key combos to navigate rapidly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { keys: "⌘ K", label: "Toggle search command palette" },
                      { keys: "⌘ /", label: "Toggle collapse navigation sidebar" },
                      { keys: "⌘ N", label: "Create a new thread (chat)" },
                    ].map((sh, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs font-semibold text-on-surface-variant/70 border-b border-white/3 pb-1.5"
                      >
                        <span>{sh.label}</span>
                        <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono text-[9px] text-primary">
                          {sh.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === "danger" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-body-sm font-bold text-error">Danger Zone</h3>
                  <p className="text-[10px] text-on-surface-variant/50 mt-1">
                    Destructive operations that cannot be undone. Exercise extreme caution.
                  </p>
                </div>

                <div className="p-4 rounded border border-error/25 bg-error-container/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-on-surface block">Wipe Vector Embeddings Index</span>
                      <span className="text-[9px] text-on-surface-variant/40 block mt-1">Delete all chunks data from ChromaDB.</span>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleResetVectorStore}
                      className="shrink-0"
                    >
                      Reset Vector Store
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Card>
      </div>

      {/* 3. Right Developer Help & Tips panel */}
      <div className="w-full lg:w-60 shrink-0 space-y-4">
        <Card variant="surface" className="p-4 border border-white/5 bg-[#0b0e14]/50 space-y-3 select-none">
          <div className="flex items-center gap-1.5 text-primary">
            <Info className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase">Helpful Guidelines</span>
          </div>

          <div className="space-y-3.5 text-[10px] leading-relaxed text-on-surface-variant/65">
            {activeSection === "workspace" && (
              <p>
                Workspaces segregate document indices and billing boundaries. The workspace ID is immutable and generated on database creation.
              </p>
            )}
            {activeSection === "providers" && (
              <div className="space-y-2">
                <p>
                  API credentials are encrypted at rest and never transmitted outside pipeline execution loops.
                </p>
                <div className="flex items-center gap-1.5 text-green-400 font-mono text-[9px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  <span>AES-256 Encrypted</span>
                </div>
              </div>
            )}
            {activeSection === "database" && (
              <p>
                Default ChromaDB runs locally in client host mode. Connect to a remote production host by modifying the server URL endpoint.
              </p>
            )}
            {activeSection === "preferences" && (
              <p>
                Keyboard shortcuts are active globally. Command palette scans all routes, databases files, and agent debugger models.
              </p>
            )}
            {activeSection === "danger" && (
              <p className="text-error font-semibold">
                Resetting the vector store deletes embeddings data indexed inside ChromaDB. Source file uploads remain stored on S3 storage buckets.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}


