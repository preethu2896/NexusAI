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
    <div className="space-y-8 max-w-6xl">
      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agentsList.map((agent) => (
          <Card key={agent.name} className="flex flex-col justify-between h-[240px]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      {agent.name}
                    </h4>
                    <span className="text-[10px] text-on-surface-variant/40 font-semibold uppercase tracking-wider block">
                      {agent.role}
                    </span>
                  </div>
                </div>
                <Badge variant="success">{agent.status}</Badge>
              </div>
              <p className="text-xs text-on-surface-variant/60 line-clamp-3 leading-relaxed mt-2">
                {agent.description}
              </p>
            </div>
            
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-on-surface-variant/50">
              <div className="flex items-center gap-3">
                <span>Model: <strong className="text-on-surface-variant">{agent.model}</strong></span>
                <span>Temp: <strong className="text-on-surface-variant">{agent.temperature}</strong></span>
              </div>
              <button className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-semibold">
                <Settings className="w-3 h-3" /> Config
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Code SDK Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface font-mono">
              Programmatic Execution (Python SDK)
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface bg-white/5 px-2.5 py-1 rounded border border-white/5 transition-all cursor-pointer"
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
        <div className="relative rounded-md overflow-hidden bg-surface-container-lowest border border-white/5">
          <pre className="p-4 font-mono text-xs text-green-400 overflow-x-auto leading-relaxed">
            <code>{sdkCode}</code>
          </pre>
        </div>
      </Card>
    </div>
  );
}
