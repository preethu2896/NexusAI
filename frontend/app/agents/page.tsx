"use client";

import React, { useState } from "react";
import {
  Bot,
  Terminal,
  Settings,
  Check,
  Copy,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export default function Agents() {
  const [copiedCode, setCopiedCode] = useState(false);

  const sdkCode = `from nexusai import AgentOrchestrator

orchestrator = AgentOrchestrator(
    model="gpt-4o-mini",
    temperature=0.0
)

# Invoke the structured planning agent pipeline
response = orchestrator.run(
    query="How does database connection pooling affect PostgreSQL throughput?",
    document_id="ac6e267a-b579-49a7-a3a6-30283dcb4fb7"
)

print(response.answer)
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sdkCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const agentsList = [
    {
      name: "Planner Agent",
      role: "Orchestration & Planning",
      description: "Generates multi-step execution plans and task trees based on user query intent.",
      model: "gpt-4o-mini",
      temperature: "0.0",
      status: "ACTIVE",
    },
    {
      name: "Retriever Agent",
      role: "Semantic Context Fetcher",
      description: "Fetches context text chunks from local ChromaDB indices using cosine similarity.",
      model: "gpt-4o-mini",
      temperature: "0.0",
      status: "ACTIVE",
    },
    {
      name: "Research Agent",
      role: "Information Synthesis",
      description: "Synthesizes multi-document chunk answers, formatting sources and citation indexes.",
      model: "gpt-4o-mini",
      temperature: "0.2",
      status: "ACTIVE",
    },
    {
      name: "SQL Agent",
      role: "Relational Query Executor",
      description: "Generates SQL schemas and queries PostgreSQL tables to inspect thread properties.",
      model: "gpt-4o-mini",
      temperature: "0.0",
      status: "ACTIVE",
    },
    {
      name: "Memory Agent",
      role: "Context Preservation",
      description: "Saves chat thread metadata history and parses citation index structures.",
      model: "gpt-4o-mini",
      temperature: "0.1",
      status: "ACTIVE",
    },
    {
      name: "Reflection Agent",
      role: "Response Refinement",
      description: "Checks LLM responses against RAG source passages to guard against hallucinations.",
      model: "gpt-4o-mini",
      temperature: "0.0",
      status: "ACTIVE",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {agentsList.map((agent) => (
          <Card key={agent.name} variant="surface" className="flex flex-col justify-between h-[260px] p-6" glowOnHover>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-body-sm font-bold text-on-surface truncate">
                      {agent.name}
                    </h4>
                    <span className="text-label-caps text-on-surface-variant/40 block truncate mt-0.5">
                      {agent.role}
                    </span>
                  </div>
                </div>
                <Badge variant="success" className="shrink-0 text-[10px] py-0 px-2">
                  {agent.status}
                </Badge>
              </div>
              <p className="text-body-sm text-on-surface-variant/75 line-clamp-3 leading-relaxed mt-4">
                {agent.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-on-surface-variant/50">
              <div className="flex items-center gap-3">
                <span>Model: <strong className="text-on-surface-variant/70">{agent.model}</strong></span>
                <span>Temp: <strong className="text-on-surface-variant/70">{agent.temperature}</strong></span>
              </div>
              <button className="text-primary hover:text-[#9cbbf5] transition-colors cursor-pointer flex items-center gap-1 font-semibold focus:outline-none bg-transparent border-none">
                <Settings className="w-3.5 h-3.5" /> Config
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Code SDK Section */}
      <Card variant="surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary shrink-0" />
            <h3 className="text-label-caps text-on-surface tracking-wider">
              Programmatic Execution (Python SDK)
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface bg-white/5 hover:bg-white/10 active:scale-[0.98] px-3 py-1.5 rounded-default border border-white/5 transition-all cursor-pointer font-medium focus:outline-none"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Snippet
              </>
            )}
          </button>
        </div>
        <div className="relative rounded-default overflow-hidden bg-surface-container-lowest border border-white/5">
          <pre className="p-4 overflow-x-auto leading-relaxed custom-scrollbar">
            <code className="text-mono-code text-green-400 block">{sdkCode}</code>
          </pre>
        </div>
      </Card>
    </div>
  );
}
