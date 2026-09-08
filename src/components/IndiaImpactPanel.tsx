"use client";

import type { IndiaImpactInsight, IndiaRegionalInsight } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { Abbr } from "./Abbr";
import { AcronymGlossary } from "./AcronymGlossary";
import {
  Activity,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Target,
} from "lucide-react";

interface Props {
  regional: IndiaRegionalInsight;
  impact: IndiaImpactInsight;
}

const trendIcon = {
  rising: TrendingUp,
  stable: Minus,
  easing: TrendingDown,
};

const trendColor = {
  rising: "text-coral",
  stable: "text-sun",
  easing: "text-leaf",
};

const DIM_ACRONYMS = ["CHVI", "CRBS", "WDPI", "VBDP", "CNSI"] as const;

function DimensionName({ name }: { name: string }) {
  for (const short of DIM_ACRONYMS) {
    const suffix = ` (${short})`;
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length);
      return (
        <>
          {base} (<Abbr of={short} />)
        </>
      );
    }
  }
  return <>{name}</>;
}

export function IndiaImpactPanel({ regional, impact }: Props) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border-2 border-saffron/30 bg-gradient-to-br from-saffron/5 via-white to-ocean/5 p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-saffron uppercase tracking-wide">
              <MapPin className="h-4 w-4" />
              India Regional Intelligence
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-ink">
              {regional.regionName}
            </h3>
            <p className="mt-1 text-sm text-ink/70">
              {regional.state} · {regional.climateZone.replace(/-/g, " ")} zone
              {regional.inMonsoonSeason && " · Monsoon season active"}
            </p>
          </div>
          <RiskBadge level={regional.risk} label={`Regional ${regional.risk}`} />
        </div>
        <p className="mt-4 text-sm text-ink/80 leading-relaxed">
          {regional.contextSummary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {regional.activeRegionalRisks.map((r) => (
            <span
              key={r}
              className="rounded-full bg-saffron/10 px-3 py-1 text-xs font-bold text-saffron capitalize"
            >
              {r.replace(/-/g, " ")}
            </span>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {regional.seasonalNotes.map((note, i) => (
            <li key={i} className="text-xs text-ink/70 flex gap-2">
              <span className="text-saffron font-bold">•</span>
              {note}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border-2 border-ocean/20 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-ocean uppercase tracking-wide">
              <BarChart3 className="h-4 w-4" />
              <Abbr of="CHIS" showExpansion />
            </p>
            <h3 className="mt-1 text-3xl font-extrabold text-ink">
              {impact.compositeScore}
              <span className="text-lg text-ink/50 font-semibold">/100</span>
            </h3>
            <p className="mt-1 text-sm font-semibold text-ink/70">
              {impact.compositeLabel}
            </p>
            <p className="mt-1 text-xs font-medium text-ink/55">
              Burden polarity · higher = more child climate-health concern
            </p>
          </div>
          <RiskBadge level={impact.risk} label={`Impact ${impact.risk}`} />
        </div>

        <div className="mt-4 h-3 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf via-sun to-coral transition-all duration-700"
            style={{ width: `${impact.compositeScore}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-ink/60 italic">
          {impact.comparedToNationalBaseline} · {impact.healthAgentAlignment}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {impact.dimensions.map((dim) => {
            const Trend = trendIcon[dim.trend];
            return (
              <article
                key={dim.id}
                className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-ocean uppercase">
                    <DimensionName name={dim.name} />
                  </p>
                  <Trend className={`h-4 w-4 ${trendColor[dim.trend]}`} />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-ink">
                  {dim.score}
                  <span className="text-sm font-medium text-ink/50">
                    {" "}
                    {dim.unit}
                  </span>
                </p>
                <p className="mt-2 text-xs text-ink/70">{dim.childSpecificNote}</p>
                <p className="mt-2 text-xs text-ink/50 italic">
                  {dim.methodology.slice(0, 120)}…
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-coral/20 bg-coral/5 p-5">
          <h4 className="flex items-center gap-2 font-extrabold text-ink">
            <Activity className="h-5 w-5 text-coral" />
            Projected child health burden
          </h4>
          <ul className="mt-3 space-y-2">
            {impact.projectedBurden.map((b, i) => (
              <li
                key={i}
                className="rounded-xl bg-white/80 px-3 py-2 text-sm text-ink/80"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-leaf/20 bg-leaf/5 p-5">
          <h4 className="flex items-center gap-2 font-extrabold text-ink">
            <Target className="h-5 w-5 text-leaf" />
            Regional action recommendations
          </h4>
          <ul className="mt-3 list-disc pl-4 space-y-2 text-sm text-ink/80">
            {impact.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <h4 className="mt-4 text-xs font-bold uppercase text-ink/50">
            Regional preparedness
          </h4>
          <ul className="mt-2 list-disc pl-4 space-y-1 text-sm text-ink/75">
            {regional.regionalActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-sky-100 bg-white/60 p-4">
        <p className="text-xs font-bold text-ink/60 uppercase">
          Open measurement methodology
        </p>
        <ul className="mt-2 space-y-1">
          {impact.measurementNotes.map((n, i) => (
            <li key={i} className="text-xs text-ink/60">
              {n}
            </li>
          ))}
        </ul>
      </section>

      <AcronymGlossary
        groups={["score", "climate", "health", "data"]}
        compact
        title="Score acronyms explained"
      />
    </div>
  );
}
