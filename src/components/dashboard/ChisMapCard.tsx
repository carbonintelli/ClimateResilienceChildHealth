"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import {
  chisBandColor,
  chisBandLabel,
  type ChisBand,
  type MapPoint,
} from "@/lib/dashboard-stats";
import { WORLD_MAP } from "@/components/dashboard/maps/world-map";
import { INDIA_MAP } from "@/components/dashboard/maps/india-map";
import { Abbr } from "@/components/Abbr";
import { acronymTitle } from "@/lib/acronyms";

function project(
  lon: number,
  lat: number,
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number },
  width: number,
  height: number,
  pad = 24
) {
  const x =
    pad +
    ((lon - bounds.minLon) / Math.max(0.0001, bounds.maxLon - bounds.minLon)) *
      (width - pad * 2);
  const y =
    pad +
    ((bounds.maxLat - lat) / Math.max(0.0001, bounds.maxLat - bounds.minLat)) *
      (height - pad * 2);
  return { x, y };
}

const BANDS: ChisBand[] = [
  "excellent",
  "good",
  "moderate",
  "high",
  "critical",
];

function analyzeHref(mode: "global" | "india", point: MapPoint): string {
  if (mode === "india") {
    return `/india?view=analyze&regionId=${encodeURIComponent(point.id)}`;
  }
  const city = point.name.split(",")[0]?.trim() || point.name;
  const countryHint = point.name.includes(",")
    ? point.name.split(",").slice(1).join(",").trim()
    : undefined;
  const rawId = point.id.trim();
  const codeFromId = rawId.includes("-")
    ? rawId.split("-")[0]?.toUpperCase()
    : /^[A-Za-z]{2}$/.test(rawId)
      ? rawId.toUpperCase()
      : undefined;
  const params = new URLSearchParams({
    view: "analyze",
    mode: "custom",
    city,
    lat: String(point.lat),
    lon: String(point.lon),
  });
  if (codeFromId && codeFromId.length === 2) {
    params.set("countryCode", codeFromId);
  }
  if (countryHint) params.set("country", countryHint);
  return `/dashboard?${params.toString()}`;
}

/** Lightweight map briefing from agent hub scores (deterministic, not LLM). */
export function mapAgentBriefing(
  points: MapPoint[],
  mode: "global" | "india"
): string {
  if (!points.length) {
    return mode === "india"
      ? "Overview Agent has no India hubs yet — try Analyze for a region."
      : "Overview Agent has no global hubs yet — try Analyze for a place.";
  }
  const ranked = [...points].sort((a, b) => a.chis - b.chis);
  const worst = ranked.slice(0, 3);
  const best = ranked[ranked.length - 1];
  const avg = Math.round(
    points.reduce((s, p) => s + p.chis, 0) / Math.max(1, points.length)
  );
  const place = mode === "india" ? "metros" : "country hubs";
  return `Map Agent read ${points.length} ${place} (avg CHIS ${avg}). Highest concern: ${worst
    .map((p) => `${p.name} (${p.chis})`)
    .join(" · ")}. Strongest signal: ${best.name} (${best.chis}). Tap a marker for details.`;
}

export function ChisMapCard({
  title,
  subtitle,
  points,
  mode,
  live = false,
}: {
  title: React.ReactNode;
  subtitle: string;
  points: MapPoint[];
  mode: "global" | "india";
  live?: boolean;
}) {
  const basemap = mode === "india" ? INDIA_MAP : WORLD_MAP;
  const { width, height, bounds, paths } = basemap;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapAriaLabel =
    mode === "india"
      ? "India Child Health Impact Score map"
      : "Global Child Health Impact Score map";

  const selected =
    points.find((p) => p.id === selectedId) ??
    [...points].sort((a, b) => a.chis - b.chis)[0] ??
    null;

  const briefing = useMemo(
    () => mapAgentBriefing(points, mode),
    [points, mode]
  );

  const pad = mode === "india" ? 28 : 24;

  return (
    <section
      id="chis-map"
      className="scroll-mt-24 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-extrabold text-ink">{title}</h2>
            {mode === "india" ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200/80">
                Survey of India boundary
              </span>
            ) : null}
          </div>
          <p className="text-sm text-ink/55">{subtitle}</p>
        </div>
        <ul
          className="flex flex-wrap gap-2"
          aria-label={acronymTitle("CHIS")}
        >
          {BANDS.map((band) => (
            <li
              key={band}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-ink/70"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: chisBandColor(band) }}
              />
              <span className="capitalize">{band}</span>
              <span className="text-ink/40">{chisBandLabel(band)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-3 flex gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-sm text-ink/75">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
        <p>
          <span className="font-bold text-sky-800">
            {live ? "Live Overview Agent" : "Overview preview"} ·{" "}
          </span>
          {briefing}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 via-sky-50 to-emerald-50/40 ring-1 ring-slate-200/70">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={mapAriaLabel}
          >
            <defs>
              <pattern
                id={`map-grid-${mode}`}
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="0.6"
                  opacity="0.4"
                />
              </pattern>
              <filter
                id={`glow-${mode}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect
              width={width}
              height={height}
              fill={`url(#map-grid-${mode})`}
            />
            <g
              fill="#94a3b8"
              fillOpacity="0.38"
              stroke="#64748b"
              strokeOpacity="0.35"
              strokeWidth="0.6"
            >
              {paths.map((d, i) => (
                <path key={`${mode}-land-${i}`} d={d} />
              ))}
            </g>

            {points.map((p) => {
              const { x, y } = project(
                p.lon,
                p.lat,
                bounds,
                width,
                height,
                pad
              );
              const color = chisBandColor(p.band);
              const active = selected?.id === p.id;
              return (
                <g
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(p.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.name}, Child Health Impact Score ${p.chis}, ${p.band}`}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 16 : 11}
                    fill={color}
                    opacity={active ? 0.28 : 0.18}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 7.5 : 5.5}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={active ? 2.2 : 1.5}
                    filter={active ? `url(#glow-${mode})` : undefined}
                  />
                  {active ? (
                    <text
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      className="fill-ink text-[11px] font-bold"
                      style={{ fontWeight: 700, fontSize: 11 }}
                    >
                      {p.chis}
                    </text>
                  ) : null}
                  <title>
                    {p.name}: Child Health Impact Score (CHIS) {p.chis} (
                    {p.band})
                  </title>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
              Selected hub
            </p>
            {selected ? (
              <>
                <div className="mt-2 flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-ocean"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-ink">
                      {selected.name}
                    </h3>
                    {selected.state ? (
                      <p className="text-xs text-ink/55">{selected.state}</p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-ink/45">
                      <Abbr of="CHIS" />
                    </p>
                    <p
                      className="mt-1 text-2xl font-extrabold"
                      style={{ color: chisBandColor(selected.band) }}
                    >
                      {selected.chis}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 ring-1 ring-slate-200/80">
                    <p className="text-[10px] font-bold uppercase text-ink/45">
                      Band
                    </p>
                    <p className="mt-1 text-sm font-extrabold capitalize text-ink">
                      {selected.band}
                    </p>
                    <p className="text-[11px] text-ink/50">
                      {chisBandLabel(selected.band)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink/60">
                  {selected.chis < 40
                    ? "Higher child climate-health concern. Run Analyze for agent guidance on heat, air, water, disease, and nutrition."
                    : selected.chis < 60
                      ? "Moderate pressure. Agents can pinpoint which dimensions need action first."
                      : "Relatively stronger wellbeing signal. Still useful to run Analyze before heatwaves or monsoon peaks."}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink/55">
                No hubs to show yet. Open Analyze to run the agent pipeline.
              </p>
            )}
          </div>

          {selected ? (
            <Link
              href={analyzeHref(mode, selected)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-ocean px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-600"
            >
              Run agents on this hub →
            </Link>
          ) : null}

          <p className="mt-3 text-[11px] leading-relaxed text-ink/45">
            {mode === "india" ? (
              <>
                Metro hubs placed by real coordinates. Lower{" "}
                <Abbr of="CHIS" /> (warmer colors) means higher child health
                burden.
              </>
            ) : (
              <>
                World land outline with country hubs placed by real coordinates.
                Lower <Abbr of="CHIS" /> (warmer colors) means higher child
                health burden.
              </>
            )}
          </p>
        </aside>
      </div>

      {mode === "india" && "source" in basemap && basemap.source ? (
        <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
          <span className="font-semibold text-ink/65">Map boundary: </span>
          {basemap.source.attribution}{" "}
          <a
            href={basemap.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ocean underline-offset-2 hover:underline"
          >
            Survey of India
          </a>
          . External boundary of India as published by Survey of India
          (Government of India); not a Natural Earth / third-party political
          sketch.
        </p>
      ) : null}
    </section>
  );
}
