"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { buildRiskRowAnalyzeHref } from "@/lib/share-links";

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/overview?scope=global");
      if (!res.ok) throw new Error(`Overview HTTP ${res.status}`);
      const json = (await res.json()) as LiveGlobal;
      setData(json);
    } catch (e) {
      setData({
        ...getGlobalOverview(),
        mode: "seed",
        error: e instanceof Error ? e.message : "Overview Agent unavailable",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const live = data.mode === "live";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white/80 px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-ink/70">
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
          {data.error ? (
            <p className="text-xs font-semibold text-coral">
              Fallback reason: {data.error}{" "}
              <button
                type="button"
                onClick={() => void load()}
                className="ml-1 underline hover:no-underline"
              >
                Retry
              </button>
            </p>
          ) : null}
          <p className="text-[11px] text-ink/45">
            Map <Abbr of="CHIS" /> values use wellbeing polarity (higher =
            healthier; 100 − burden). Analyze reports show burden (higher =
            more concern).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!live && !loading ? (
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink/70 hover:bg-slate-50"
            >
              Retry live feed
            </button>
          ) : null}
          <Link
            href="/dashboard?view=analyze"
            className="rounded-full bg-ocean px-4 py-2 text-sm font-bold text-white hover:bg-sky-600"
          >
            Open Analyze
          </Link>
        </div>
      </div>

      <KpiCardGrid items={data.kpis} />

      <ChisMapCard
        title={
          <>
            Global <Abbr of="CHIS" /> map
          </>
        }
        subtitle={
          live
            ? "Wellbeing view (higher = healthier) · live agent hubs"
            : "Wellbeing view (higher = healthier) · monitored country hubs"
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
          rowHref={(row) => buildRiskRowAnalyzeHref("global", row.id)}
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
  );
}
