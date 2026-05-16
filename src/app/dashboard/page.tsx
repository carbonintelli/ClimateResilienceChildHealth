"use client";

import { useCallback, useEffect, useState } from "react";
import type { CountryOption, SynthesisReport } from "@/lib/types";
import { CountrySelector } from "@/components/CountrySelector";
import { ReportView } from "@/components/ReportView";
import { Loader2, Radar } from "lucide-react";

export default function DashboardPage() {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countryCode, setCountryCode] = useState("IN");
  const [report, setReport] = useState<SynthesisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((data: CountryOption[]) => {
        setCountries(data);
        if (data.length && !data.find((c) => c.code === countryCode)) {
          setCountryCode(data[0].code);
        }
      })
      .catch(() => setError("Could not load countries"));
  }, [countryCode]);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Analysis failed");
      setReport(data as SynthesisReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [countryCode]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink flex items-center gap-3">
          <Radar className="h-8 w-8 text-ocean" />
          Global climate-health dashboard
        </h1>
        <p className="mt-2 text-ink/70 max-w-2xl">
          Select any supported country. Five AI agents fetch live climate data,
          correlate health and nutrition risks, and generate child-ready
          preparedness guidance.
        </p>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-lg max-w-xl">
        <CountrySelector
          countries={countries.length ? countries : [{ code: "IN", name: "India", flag: "🇮🇳" }]}
          value={countryCode}
          onChange={setCountryCode}
          disabled={loading}
        />
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-ocean py-4 font-extrabold text-white shadow-md hover:bg-sky-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Agents working…
            </>
          ) : (
            "Run agentic analysis"
          )}
        </button>
        {error && (
          <p className="mt-3 text-sm font-medium text-coral">{error}</p>
        )}
      </div>

      {report && (
        <div className="mt-10">
          <ReportView report={report} />
        </div>
      )}
    </div>
  );
}
