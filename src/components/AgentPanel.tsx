import type { AgentStatus } from "@/lib/types";
import { Bot, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const statusIcon = {
  idle: Loader2,
  fetching: Loader2,
  analyzing: Loader2,
  complete: CheckCircle2,
  error: AlertCircle,
};

export function AgentPanel({ agents }: { agents: AgentStatus[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => {
        const Icon = statusIcon[agent.status];
        const spinning =
          agent.status === "fetching" || agent.status === "analyzing";
        return (
          <div
            key={agent.id}
            className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-xl bg-ocean/10 p-2 ${spinning ? "agent-pulse" : ""}`}
              >
                <Bot className="h-5 w-5 text-ocean" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-ink">{agent.name}</h3>
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      agent.status === "complete"
                        ? "text-leaf"
                        : agent.status === "error"
                          ? "text-coral"
                          : "text-ocean"
                    } ${spinning ? "animate-spin" : ""}`}
                  />
                </div>
                <p className="mt-1 text-xs text-ink/60">{agent.role}</p>
                <p className="mt-2 text-xs font-medium text-ocean">
                  Source: {agent.source.name}
                </p>
                {agent.summary && (
                  <p className="mt-1 text-xs text-ink/80">{agent.summary}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
