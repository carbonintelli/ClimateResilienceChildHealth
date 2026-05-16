"use client";

import type { SynthesisReport } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { AgentPanel } from "./AgentPanel";
import {
  Droplets,
  Thermometer,
  Wind,
  Heart,
  Apple,
  Bug,
  Link2,
} from "lucide-react";

export function ReportView({ report }: { report: SynthesisReport }) {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ocean uppercase tracking-wide">
              {report.location.city}, {report.location.country}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">
              Climate disruption outlook
            </h2>
            <p className="mt-2 text-ink/70">
              Window: <strong>{report.disruptionWindow}</strong> · Updated{" "}
              {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
          <RiskBadge level={report.overallRisk} label={`${report.overallRisk} risk`} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            icon={Thermometer}
            label="Now"
            value={`${report.climate.temperatureC}°C`}
          />
          <Stat
            icon={Droplets}
            label="Humidity"
            value={`${report.climate.humidity}%`}
          />
          <Stat
            icon={Wind}
            label="Wind"
            value={`${report.climate.windSpeedKmh} km/h`}
          />
          <Stat
            icon={Thermometer}
            label="Heat index"
            value={`${report.climate.heatIndex ?? "—"}°C`}
          />
        </div>
        {report.climate.airQualityIndex != null && (
          <p className="mt-4 text-sm text-ink/70">
            Air quality index (US AQI):{" "}
            <strong>{report.climate.airQualityIndex}</strong>
          </p>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-lg font-extrabold text-ink">
          Agentic AI pipeline
        </h3>
        <AgentPanel agents={report.agents} />
      </section>

      <section className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6">
        <h3 className="flex items-center gap-2 text-lg font-extrabold text-ink">
          <Link2 className="h-5 w-5 text-ocean" />
          Cross-agent correlations
        </h3>
        <ul className="mt-4 space-y-3">
          {report.correlations.map((c, i) => (
            <li
              key={i}
              className="rounded-xl bg-white/80 px-4 py-3 text-sm text-ink/80 border border-amber-100"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <InsightCard
          icon={Heart}
          title="Health"
          items={report.health.map((h) => ({
            title: h.title,
            risk: h.risk,
            body: h.description,
            list: h.actions,
          }))}
        />
        <InsightCard
          icon={Apple}
          title="Food & nutrition"
          items={[
            {
              title: report.nutrition.title,
              risk: report.nutrition.risk,
              body: report.nutrition.description,
              list: [
                ...report.nutrition.recommendedFoods.map((f) => `Eat: ${f}`),
                ...report.nutrition.avoid.map((a) => `Avoid: ${a}`),
                `Hydration target: ~${report.nutrition.hydrationLiters}L/day`,
              ],
            },
          ]}
        />
        <InsightCard
          icon={Bug}
          title="Disease preparedness"
          items={[
            {
              title: "Outlook",
              risk: report.disease.risk,
              body: report.disease.conditions.join(", "),
              list: report.disease.prevention,
            },
          ]}
        />
      </div>

      <section>
        <h3 className="mb-4 text-lg font-extrabold text-ink">
          Guidance for children
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {report.childGuidance.map((g) => (
            <article
              key={g.ageBand}
              className="rounded-3xl border-2 border-sky-100 bg-white p-5 shadow-md"
            >
              <span className="text-3xl">{g.emoji}</span>
              <p className="mt-2 text-xs font-bold text-ocean">
                Ages {g.ageBand}
              </p>
              <h4 className="mt-1 font-extrabold text-ink">{g.headline}</h4>
              <p className="mt-2 text-sm text-ink/75">{g.simpleExplanation}</p>
              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-ink/50">
                  Prepare today
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm text-ink/80 space-y-1">
                  {g.prepareToday.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <p className="text-xs font-bold uppercase text-ink/50">
                  Ask a caring adult
                </p>
                <ul className="mt-1 list-disc pl-4 text-sm text-ink/80 space-y-1">
                  {g.askAdultFor.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              {g.funFact && (
                <p className="mt-3 rounded-xl bg-sky-50 p-3 text-xs text-ocean font-medium">
                  💡 {g.funFact}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="text-xs text-ink/50">
        <p className="font-bold text-ink/60 mb-2">Data provenance</p>
        <ul className="space-y-1">
          {report.dataProvenance.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean hover:underline"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-sky-50 p-3 text-center">
      <Icon className="mx-auto h-5 w-5 text-ocean" />
      <p className="mt-1 text-xs text-ink/50">{label}</p>
      <p className="font-bold text-ink">{value}</p>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: {
    title: string;
    risk: import("@/lib/types").RiskLevel;
    body: string;
    list: string[];
  }[];
}) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 font-extrabold text-ink">
        <Icon className="h-5 w-5 text-ocean" />
        {title}
      </h3>
      <div className="mt-4 space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-sm">{item.title}</p>
              <RiskBadge level={item.risk} />
            </div>
            <p className="mt-1 text-sm text-ink/70">{item.body}</p>
            <ul className="mt-2 list-disc pl-4 text-xs text-ink/75 space-y-1">
              {item.list.slice(0, 5).map((l, j) => (
                <li key={j}>{l}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
