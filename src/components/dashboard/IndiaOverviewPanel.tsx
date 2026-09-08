"use client";

import { useEffect, useState } from "react";
import {
  getIndiaOverview,
  type IndiaOverview,
} from "@/lib/dashboard-stats";
import { KpiCardGrid } from "@/components/dashboard/KpiCards";
import { ChisMapCard } from "@/components/dashboard/ChisMapCard";
import { RiskTableCard } from "@/components/dashboard/RiskTableCard";
import {
  DimensionsDonutCard,
  TrendLineCard,
} from "@/components/dashboard/ChartCards";
import { AcronymGlossary } from "@/components/AcronymGlossary";
import { Abbr } from "@/components/Abbr";
import {
  Panel,
  ConsoleButton,
  StatusBadge,
} from "@/components/ui/console";

type LiveIndia = IndiaOverview & {
  mode?: "live" | "seed";
  probed?: number;
  failed?: number;
  error?: string;
};

export function IndiaOverviewPanel() {
  const [data, setData] = useState<LiveIndia>(() => ({
    ...getIndiaOverview(),
    mode: "seed",
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/overview?scope=india");
        if (!res.ok) throw new Error(`Overview HTTP ${res.status}`);
        const json = (await res.json()) as LiveIndia;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData({ ...getIndiaOverview(), mode: "seed" });
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
              India Overview Agent
            </span>
          </div>
          <p className="text-sm leading-relaxed text-ink/70">
            {loading ? (
              <>Running India Overview Agent across metro hubs…</>
            ) : live ? (
              <>
                Live agent <Abbr of="CHIS" /> average{" "}
                <strong>{data.avgChis}</strong> ·{" "}
                <strong>{data.probed ?? data.mapPoints.length}</strong> metros ·{" "}
                <strong>{data.sources}</strong> sources
                {typeof data.failed === "number" && data.failed > 0
                  ? ` · ${data.failed} hub(s) failed`
                  : ""}
                .
              </>
            ) : (
              <>
                Seeded India <Abbr of="CHIS" /> average{" "}
                <strong>{data.avgChis}</strong> · live Overview Agent
                unavailable. Run a region analysis for agents.
              </>
            )}
          </p>
        </div>
        <ConsoleButton href="/india?view=analyze" variant="india">
          Analyze a region
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
              India <Abbr of="CHIS" /> map
            </>
          }
          subtitle={
            live
              ? "India outline · metro hubs from live Overview Agent"
              : "India outline · state and metro hubs by Child Health Impact Score"
          }
          points={data.mapPoints}
          mode="india"
          live={live}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          <RiskTableCard
            id="top-states"
            title={
              <>
                Top 5 states by <Abbr of="CHIS" /> risk
              </>
            }
            rows={data.topStates}
            footerHref="/india?view=analyze"
            footerLabel="View all regions →"
          />
          <TrendLineCard
            id="trend"
            title="Child Health Impact Score (CHIS) trend (India)"
            points={data.trend}
          />
          <DimensionsDonutCard
            id="dimensions"
            title="Dimension overview (India)"
            slices={data.dimensions}
          />
        </div>

        <AcronymGlossary
          groups={["score", "climate", "health", "data"]}
          compact
          title="What do these acronyms mean?"
        />
      </div>
    </div>
  );
}
