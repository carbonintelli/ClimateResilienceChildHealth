"use client";

import { useEffect, useState } from "react";
import {
  getGlobalOverview,
  type GlobalOverview,
} from "@/lib/dashboard-stats";
import { KpiCardGrid } from "@/components/dashboard/KpiCards";
import { ChisMapCard } from "@/components/dashboard/ChisMapCard";
import { RiskTableCard } from "@/components/dashboard/RiskTableCard";
import { AlertsDonutCard } from "@/components/dashboard/ChartCards";
import { AcronymGlossary } from "@/components/AcronymGlossary";
import { Abbr } from "@/components/Abbr";
import {
  Panel,
  ConsoleButton,
  StatusBadge,
} from "@/components/ui/console";

type LiveGlobal = GlobalOverview & {
  mode?: "live" | "seed";
  probed?: number;
  failed?: number;
  error?: string;
};

export function GlobalOverviewPanel() {
  const [data, setData] = useState<LiveGlobal>(() => ({
    ...getGlobalOverview(),
    mode: "seed",
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/overview?scope=global");
        if (!res.ok) throw new Error(`Overview HTTP ${res.status}`);
        const json = (await res.json()) as LiveGlobal;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData({ ...getGlobalOverview(), mode: "seed" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const live = data.mode === "live";

  return (
    <div className="space-y-5">
      <Panel className="flex flex-wrap items-center justify-between gap-3 !py-3.5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={loading ? "neutral" : live ? "live" : "seed"}>
              {loading ? "Syncing" : live ? "Live" : "Seeded"}
            </StatusBadge>
            <span className="text-xs font-semibold text-ink/45">
              Overview Agent
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink/70">
            {loading ? (
              <>Running Overview Agent across climate hubs…</>
            ) : live ? (
              <>
                Live agent probes ·{" "}
                <strong>{data.probed ?? data.mapPoints.length}</strong> hubs ·{" "}
                <strong>{data.sources}</strong> trusted sources
                {typeof data.failed === "number" && data.failed > 0
                  ? ` · ${data.failed} hub(s) failed`
                  : ""}
                . Need a place-level run?
              </>
            ) : (
              <>
                Seeded registry preview · live Overview Agent unavailable. Need
                a place-level agent run?
              </>
            )}
          </p>
        </div>
        <ConsoleButton href="/dashboard?view=analyze" variant="primary">
          Open Analyze
        </ConsoleButton>
      </Panel>

      <div
        className={`space-y-5 transition-opacity duration-300 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        <KpiCardGrid items={data.kpis} loading={loading} />

        <ChisMapCard
          title={
            <>
              Global <Abbr of="CHIS" /> map
            </>
          }
          subtitle={
            live
              ? "Real-world map · Child Health Impact Score from live agent hubs"
              : "Real-world map · Child Health Impact Score by monitored country hubs"
          }
          points={data.mapPoints}
          mode="global"
          live={live}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <RiskTableCard
            id="high-risk"
            title="Top 5 high-risk regions"
            rows={data.highRisk}
            footerHref="/dashboard?view=analyze"
            footerLabel="Analyze a high-risk place →"
          />
          <AlertsDonutCard
            id="alerts"
            title="Global alerts summary"
            slices={data.alerts}
          />
        </div>

        <AcronymGlossary
          groups={["score", "climate", "governance"]}
          compact
          title="What do these acronyms mean?"
        />
      </div>
    </div>
  );
}
