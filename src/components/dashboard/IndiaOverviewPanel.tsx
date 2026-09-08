"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getIndiaOverview,
  type IndiaOverview,
} from "@/lib/dashboard-stats";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { KpiCardGrid } from "@/components/dashboard/KpiCards";
import { ChisMapCard } from "@/components/dashboard/ChisMapCard";
import { RiskTableCard } from "@/components/dashboard/RiskTableCard";
import {
  DimensionsDonutCard,
  TrendLineCard,
} from "@/components/dashboard/ChartCards";
import { AcronymGlossary } from "@/components/AcronymGlossary";
import { Abbr } from "@/components/Abbr";
import { buildRiskRowAnalyzeHref } from "@/lib/share-links";

type LiveIndia = IndiaOverview & {
  mode?: "live" | "seed";
  probed?: number;
  failed?: number;
  error?: string;
};

function regionIdForState(stateName: string): string | undefined {
  return INDIA_REGIONS.find((r) => r.state === stateName)?.id;
}

export function IndiaOverviewPanel() {
  const [data, setData] = useState<LiveIndia>(() => ({
    ...getIndiaOverview(),
    mode: "seed",
  }));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/overview?scope=india");
      if (!res.ok) throw new Error(`Overview HTTP ${res.status}`);
      const json = (await res.json()) as LiveIndia;
      setData(json);
    } catch (e) {
      setData({
        ...getIndiaOverview(),
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm text-ink/70">
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
            healthier; 100 − burden). Analyze / India Impact reports show
            burden (higher = more concern).
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
            href="/india?view=analyze"
            className="rounded-full bg-gradient-to-r from-saffron to-ocean px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Analyze a region
          </Link>
        </div>
      </div>

      <KpiCardGrid items={data.kpis} />

      <ChisMapCard
        title={
          <>
            India <Abbr of="CHIS" /> map
          </>
        }
        subtitle={
          live
            ? "Wellbeing view (higher = healthier) · live metro hubs"
            : "Wellbeing view (higher = healthier) · state and metro hubs"
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
          rowHref={(row) =>
            buildRiskRowAnalyzeHref(
              "india",
              row.id,
              regionIdForState(row.id) ?? regionIdForState(row.name)
            )
          }
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
  );
}
