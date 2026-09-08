import {
  Bell,
  Globe2,
  MapPinned,
  Users,
  type LucideIcon,
} from "lucide-react";

const TONE = {
  blue: {
    value: "text-sky-600",
    icon: "bg-sky-50 text-sky-600",
    ring: "group-hover:ring-sky-200/80",
  },
  green: {
    value: "text-emerald-600",
    icon: "bg-emerald-50 text-emerald-600",
    ring: "group-hover:ring-emerald-200/80",
  },
  purple: {
    value: "text-violet-600",
    icon: "bg-violet-50 text-violet-600",
    ring: "group-hover:ring-violet-200/80",
  },
  red: {
    value: "text-rose-600",
    icon: "bg-rose-50 text-rose-600",
    ring: "group-hover:ring-rose-200/80",
  },
} as const;

const ICONS: LucideIcon[] = [Globe2, MapPinned, Users, Bell];

export function KpiCardGrid({
  items,
  loading = false,
}: {
  items: {
    id: string;
    label: string;
    value: string;
    tone: keyof typeof TONE;
  }[];
  loading?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${loading ? "opacity-70" : ""}`}
      aria-busy={loading || undefined}
    >
      {items.map((item, i) => {
        const tone = TONE[item.tone];
        const Icon = ICONS[i % ICONS.length];
        return (
          <article
            key={item.id}
            className={`group rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(15,23,42,0.08)] ${tone.ring}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/45">
                  {item.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-extrabold tracking-tight ${tone.value}`}
                >
                  {item.value}
                </p>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tone.icon}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
