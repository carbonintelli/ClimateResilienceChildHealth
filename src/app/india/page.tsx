"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { SynthesisReport } from "@/lib/types";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { IndiaRegionSelector } from "@/components/IndiaRegionSelector";
import { ReportView } from "@/components/ReportView";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { IndiaOverviewPanel } from "@/components/dashboard/IndiaOverviewPanel";
import { Loader2 } from "lucide-react";

function IndiaAnalyzePanel() {
  const searchParams = useSearchParams();
  const regionFromUrl = searchParams.get("regionId");
  const initialRegion =
    regionFromUrl && INDIA_REGIONS.some((r) => r.id === regionFromUrl)
      ? regionFromUrl
      : "delhi-ncr";
  const [regionId, setRegionId] = useState(initialRegion);
  const [report, setReport] = useState<SynthesisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: "IN", regionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "Analysis failed");
      }
      setReport(data as SynthesisReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
        <h2 className="text-lg font-extrabold text-ink">Region analysis</h2>
        <p className="text-sm text-ink/60">
          Run India agents for one of {INDIA_REGIONS.length} regions and review
          the Child Health Impact Score.
        </p>
      </div>

      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
        <IndiaRegionSelector
          regions={INDIA_REGIONS}
          value={regionId}
          onChange={setRegionId}
          disabled={loading}
        />
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-ocean py-3.5 font-extrabold text-white shadow-sm transition-[transform,opacity] duration-150 hover:opacity-95 active:scale-[0.99] disabled:opacity-55"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              India agents measuring impact…
            </>
          ) : (
            "Run India child health impact analysis"
          )}
        </button>
        {error ? (
          <p className="mt-3 text-sm font-medium text-coral">{error}</p>
        ) : null}
      </div>

      {report ? (
        <ReportView report={report} showIndiaPanel />
      ) : null}
    </div>
  );
}

function IndiaConsole() {
  const searchParams = useSearchParams();
  const analyze = searchParams.get("view") === "analyze";

  return (
    <DashboardShell variant="india">
      {analyze ? <IndiaAnalyzePanel /> : <IndiaOverviewPanel />}
    </DashboardShell>
  );
}

export default function IndiaDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#eef2f7] text-ink/70">
          Loading India dashboard…
        </div>
      }
    >
      <IndiaConsole />
    </Suspense>
  );
}
