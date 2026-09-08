"use client";

import { getAcronym } from "@/lib/acronyms";

type Props = {
  /** Acronym short form, e.g. "CHIS" or "AQI" */
  of: string;
  /** Optional custom visible text (defaults to the short form) */
  children?: React.ReactNode;
  className?: string;
  /** Show expansion in parentheses after the short form */
  showExpansion?: boolean;
  /** Tooltip colors for light surfaces vs dark overlays */
  tone?: "onLight" | "onDark";
};

/**
 * Accessible acronym marker: native &lt;abbr&gt; plus a focusable tooltip.
 * Hover or keyboard focus shows the expansion and plain-language meaning.
 */
export function Abbr({
  of,
  children,
  className = "",
  showExpansion = false,
  tone = "onLight",
}: Props) {
  const entry = getAcronym(of);
  const label = children ?? entry?.short ?? of;

  if (!entry) {
    return <span className={className}>{label}</span>;
  }

  const title = `${entry.expansion}: ${entry.explanation}`;
  const tipTone =
    tone === "onDark"
      ? "bg-white text-ink shadow-xl ring-1 ring-slate-200"
      : "bg-ink text-white shadow-lg";
  const tipBody = tone === "onDark" ? "text-ink/70" : "text-white/85";

  return (
    <span className={`group/abbr relative inline-flex items-baseline ${className}`}>
      <abbr
        title={title}
        className="cursor-help border-b border-dotted border-current/35 no-underline decoration-from-font outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ocean/50"
        tabIndex={0}
        aria-label={`${entry.short}, ${entry.expansion}. ${entry.explanation}`}
      >
        {label}
      </abbr>
      {showExpansion ? (
        <span className="ml-1 font-medium opacity-70">
          ({entry.expansion})
        </span>
      ) : null}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-xl px-3 py-2 text-left text-xs font-semibold leading-snug opacity-0 transition-opacity duration-150 group-hover/abbr:opacity-100 group-focus-within/abbr:opacity-100 sm:max-w-[18rem] ${tipTone}`}
      >
        <span className="block font-extrabold tracking-wide">
          {entry.short} — {entry.expansion}
        </span>
        <span className={`mt-1 block font-medium ${tipBody}`}>
          {entry.explanation}
        </span>
      </span>
    </span>
  );
}
