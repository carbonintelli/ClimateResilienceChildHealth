import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { chisBandColor, type RegionRiskRow } from "@/lib/dashboard-stats";
import { Abbr } from "@/components/Abbr";

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
  rowHref,
}: {
  id: string;
  title: React.ReactNode;
  rows: RegionRiskRow[];
  footerHref?: string;
  footerLabel?: string;
  /** Optional deep-link builder for each risk row */
  rowHref?: (row: RegionRiskRow) => string | undefined;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 sm:p-5"
    >
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
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
            {rows.map((row) => {
              const href = rowHref?.(row);
              return (
              <tr
                key={row.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/80"
              >
                <td className="py-3">
                  {href ? (
                    <Link href={href} className="group block">
                      <p className="font-bold text-ink group-hover:text-ocean">
                        {row.name}
                      </p>
                      <p className="text-xs text-ink/50">{row.sublabel}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-ocean/80">
                        Open Analyze →
                      </p>
                    </Link>
                  ) : (
                    <>
                      <p className="font-bold text-ink">{row.name}</p>
                      <p className="text-xs text-ink/50">{row.sublabel}</p>
                    </>
                  )}
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
            );
            })}
          </tbody>
        </table>
      </div>
      {footerHref && footerLabel ? (
        <a
          href={footerHref}
          className="mt-3 inline-flex text-sm font-bold text-ocean hover:underline"
        >
          {footerLabel}
        </a>
      ) : null}
    </section>
  );
}
