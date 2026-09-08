import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { chisBandColor, type RegionRiskRow } from "@/lib/dashboard-stats";
import { Abbr } from "@/components/Abbr";
import { Panel, PanelTitle } from "@/components/ui/console";

function TrendIcon({ trend }: { trend: RegionRiskRow["trend"] }) {
  if (trend === "rising") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
        <ArrowUpRight className="h-3.5 w-3.5" /> Rising
      </span>
    );
  }
  if (trend === "easing") {
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
        <ArrowDownRight className="h-3.5 w-3.5" /> Easing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
      <ArrowRight className="h-3.5 w-3.5" /> Stable
    </span>
  );
}

export function RiskTableCard({
  id,
  title,
  rows,
  footerHref,
  footerLabel,
}: {
  id: string;
  title: React.ReactNode;
  rows: RegionRiskRow[];
  footerHref?: string;
  footerLabel?: string;
}) {
  return (
    <Panel id={id}>
      <PanelTitle>{title}</PanelTitle>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-ink/45">
              <th className="pb-2 font-bold">Region</th>
              <th className="pb-2 font-bold">
                <Abbr of="CHIS" />
              </th>
              <th className="pb-2 font-bold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
              >
                <td className="py-3">
                  <p className="font-bold text-ink">{row.name}</p>
                  <p className="text-xs text-ink/50">{row.sublabel}</p>
                </td>
                <td className="py-3">
                  <span
                    className="inline-flex min-w-[2.5rem] items-center justify-center rounded-lg px-2 py-1 text-sm font-extrabold text-white"
                    style={{ background: chisBandColor(row.band) }}
                  >
                    {row.chis}
                  </span>
                </td>
                <td className="py-3 text-xs">
                  <TrendIcon trend={row.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footerHref && footerLabel ? (
        <a
          href={footerHref}
          className="mt-4 inline-flex text-sm font-bold text-ocean transition-colors hover:text-sky-700"
        >
          {footerLabel}
        </a>
      ) : null}
    </Panel>
  );
}
