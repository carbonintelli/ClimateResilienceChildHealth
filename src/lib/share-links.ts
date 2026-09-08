import type { SynthesisReport } from "@/lib/types";

/**
 * Build a deep-link that opens Analyze and rehydrates the same place.
 * India region reports prefer `/india`; everything else uses custom coords on `/dashboard`.
 */
export function buildReportSharePath(report: SynthesisReport): string {
  const regionId = report.indiaRegional?.regionId;
  if (report.location.countryCode === "IN" && regionId) {
    const params = new URLSearchParams({
      view: "analyze",
      regionId,
    });
    return `/india?${params.toString()}`;
  }

  const params = new URLSearchParams({
    view: "analyze",
    mode: "custom",
    countryCode: report.location.countryCode,
    country: report.location.country,
    city: report.location.city,
    lat: String(report.location.lat),
    lon: String(report.location.lon),
  });
  return `/dashboard?${params.toString()}`;
}

/** Kids Play handoff with optional place + age prefill. */
export function buildPlayPath(opts: {
  countryCode?: string;
  cityId?: string;
  regionId?: string;
  ageBand?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.countryCode) params.set("countryCode", opts.countryCode);
  if (opts.cityId) params.set("cityId", opts.cityId);
  if (opts.regionId) params.set("regionId", opts.regionId);
  if (opts.ageBand) params.set("ageBand", opts.ageBand);
  const q = params.toString();
  return q ? `/play?${q}` : "/play";
}

/** Analyze deep-link for a risk-table row. */
export function buildRiskRowAnalyzeHref(
  scope: "global" | "india",
  rowId: string,
  indiaRegionId?: string
): string {
  if (scope === "india") {
    const regionId = indiaRegionId ?? rowId;
    return `/india?view=analyze&regionId=${encodeURIComponent(regionId)}`;
  }
  return `/dashboard?view=analyze&mode=curated&countryCode=${encodeURIComponent(rowId)}`;
}
