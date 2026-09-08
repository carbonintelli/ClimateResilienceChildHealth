"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import type { SynthesisReport } from "@/lib/types";
import { buildReportSharePath } from "@/lib/share-links";

function buildShareUrl(report: SynthesisReport): string {
  return new URL(buildReportSharePath(report), window.location.origin).toString();
}

function buildShareText(report: SynthesisReport): string {
  const top = report.correlations[0];
  return [
    `KlimaGuard Kids — ${report.location.city}, ${report.location.country}`,
    `Overall risk: ${report.overallRisk} · Window: ${report.disruptionWindow}`,
    top ? `Signal: ${top}` : null,
    "Preparedness guidance (not medical diagnosis).",
  ]
    .filter(Boolean)
    .join("\n");
}

export function ShareReportButton({ report }: { report: SynthesisReport }) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared" | "error">(
    "idle"
  );

  const onShare = async () => {
    const url = buildShareUrl(report);
    const text = buildShareText(report);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `KlimaGuard Kids — ${report.location.city}`,
          text,
          url,
        });
        setStatus("shared");
      } else if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setStatus("copied");
      } else {
        throw new Error("Share not supported");
      }
    } catch (e) {
      // User cancel on share sheet is fine
      if (e instanceof Error && e.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setStatus("copied");
      } catch {
        setStatus("error");
      }
    }
    window.setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <button
      type="button"
      onClick={onShare}
      className="inline-flex items-center gap-2 rounded-full border-2 border-ocean/20 bg-white px-4 py-2 text-sm font-bold text-ocean shadow-sm hover:bg-sky-50"
    >
      {status === "copied" || status === "shared" ? (
        <Check className="h-4 w-4 text-leaf" />
      ) : status === "error" ? (
        <Link2 className="h-4 w-4 text-coral" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {status === "copied"
        ? "Link copied"
        : status === "shared"
          ? "Shared"
          : status === "error"
            ? "Share failed"
            : "Share this place"}
    </button>
  );
}
