import type { RiskLevel } from "@/lib/types";

const styles: Record<RiskLevel, string> = {
  low: "bg-leaf/20 text-green-800 border-green-300",
  moderate: "bg-sun/30 text-amber-900 border-amber-300",
  high: "bg-coral/20 text-rose-900 border-rose-300",
  critical: "bg-red-600 text-white border-red-700",
};

export function RiskBadge({ level, label }: { level: RiskLevel; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${styles[level]}`}
    >
      {label ?? level}
    </span>
  );
}
