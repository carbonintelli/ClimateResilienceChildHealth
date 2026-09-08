import { Panel, PanelTitle } from "@/components/ui/console";
import type {
  AlertSlice,
  DimensionSlice,
  TrendPoint,
} from "@/lib/dashboard-stats";

function Donut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let cursor = 0;
  const gradient = slices
    .map((slice) => {
      const start = (cursor / total) * 360;
      cursor += slice.value;
      const end = (cursor / total) * 360;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label={centerLabel}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
          <p className="text-2xl font-extrabold text-ink">{centerValue}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
            {centerLabel}
          </p>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {slices.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 font-semibold text-ink/80">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: slice.color }}
              />
              {slice.label}
            </span>
            <span className="font-extrabold text-ink">
              {slice.value}
              <span className="ml-1 text-xs font-semibold text-ink/45">
                ({Math.round((slice.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AlertsDonutCard({
  id,
  title,
  slices,
}: {
  id: string;
  title: string;
  slices: AlertSlice[];
}) {
  const total = slices.reduce((s, x) => s + x.count, 0);
  return (
    <Panel id={id}>
      <PanelTitle className="mb-4">{title}</PanelTitle>
      <Donut
        slices={slices.map((s) => ({
          label: s.label,
          value: s.count,
          color: s.color,
        }))}
        centerLabel="Alerts"
        centerValue={String(total)}
      />
    </Panel>
  );
}

export function DimensionsDonutCard({
  id,
  title,
  slices,
}: {
  id: string;
  title: string;
  slices: DimensionSlice[];
}) {
  const avg = Math.round(
    slices.reduce((s, x) => s + x.score, 0) / Math.max(1, slices.length)
  );
  return (
    <Panel id={id}>
      <PanelTitle className="mb-4">{title}</PanelTitle>
      <Donut
        slices={slices.map((s) => ({
          label: `${s.label} (${s.score})`,
          value: s.score,
          color: s.color,
        }))}
        centerLabel="Avg"
        centerValue={String(avg)}
      />
    </Panel>
  );
}

export function TrendLineCard({
  id,
  title,
  points,
}: {
  id: string;
  title: string;
  points: TrendPoint[];
}) {
  const width = 420;
  const height = 180;
  const padX = 28;
  const padY = 24;
  const min = Math.min(...points.map((p) => p.value)) - 5;
  const max = Math.max(...points.map((p) => p.value)) + 5;
  const coords = points.map((p, i) => {
    const x =
      padX + (i / Math.max(1, points.length - 1)) * (width - padX * 2);
    const y =
      padY +
      (1 - (p.value - min) / Math.max(1, max - min)) * (height - padY * 2);
    return { x, y, ...p };
  });
  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  return (
    <Panel id={id}>
      <PanelTitle className="mb-4">{title}</PanelTitle>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={title}
      >
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="#e2e8f0"
        />
        <path
          d={path}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {coords.map((c) => (
          <g key={c.label}>
            <circle cx={c.x} cy={c.y} r="4.5" fill="#0284c7" />
            <text
              x={c.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="10"
            >
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </Panel>
  );
}
