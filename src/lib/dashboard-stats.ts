import { CITY_COUNT, CITIES_BY_COUNTRY, COUNTRIES } from "./countries";
import { INDIA_REGIONS } from "./india-regions";
import { TRUSTED_SOURCES } from "./sources";

export type ChisBand = "critical" | "high" | "moderate" | "good" | "excellent";

export type RegionRiskRow = {
  id: string;
  name: string;
  sublabel: string;
  chis: number;
  band: ChisBand;
  trend: "rising" | "stable" | "easing";
  alerts: number;
};

export type AlertSlice = {
  id: string;
  label: string;
  count: number;
  color: string;
};

export type DimensionSlice = {
  id: string;
  label: string;
  score: number;
  color: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type MapPoint = {
  id: string;
  name: string;
  chis: number;
  band: ChisBand;
  lat: number;
  lon: number;
  state?: string;
};

function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function chisFromSeed(seed: string, bias = 0): number {
  const raw = 18 + Math.floor(hash01(seed) * 72) + bias;
  return Math.max(5, Math.min(98, raw));
}

export function chisBand(score: number): ChisBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "moderate";
  if (score >= 20) return "high";
  return "critical";
}

export function chisBandColor(band: ChisBand): string {
  switch (band) {
    case "excellent":
      return "#166534";
    case "good":
      return "#22c55e";
    case "moderate":
      return "#eab308";
    case "high":
      return "#f97316";
    case "critical":
      return "#dc2626";
  }
}

export function chisBandLabel(band: ChisBand): string {
  switch (band) {
    case "excellent":
      return "80–100";
    case "good":
      return "60–79";
    case "moderate":
      return "40–59";
    case "high":
      return "20–39";
    case "critical":
      return "0–19";
  }
}

function trendFromSeed(seed: string): RegionRiskRow["trend"] {
  const n = hash01(`${seed}-trend`);
  if (n < 0.38) return "rising";
  if (n < 0.72) return "stable";
  return "easing";
}

/** Deterministic overview metrics for the Global CHIS console (registry-backed). */
export function getGlobalOverview() {
  const countryRows: RegionRiskRow[] = COUNTRIES.map((c) => {
    const cities = CITIES_BY_COUNTRY[c.code] ?? [];
    const chis = chisFromSeed(c.code);
    const alerts = 1 + Math.floor(hash01(`${c.code}-a`) * 4);
    return {
      id: c.code,
      name: c.name,
      sublabel: `${cities.length} cities`,
      chis,
      band: chisBand(chis),
      trend: trendFromSeed(c.code),
      alerts,
    };
  });

  const highRisk = [...countryRows].sort((a, b) => a.chis - b.chis).slice(0, 5);
  const totalAlerts = countryRows.reduce((s, r) => s + r.alerts, 0);
  const high = countryRows.filter(
    (r) => r.band === "critical" || r.band === "high"
  ).length;
  const medium = countryRows.filter((r) => r.band === "moderate").length;
  const low = countryRows.filter(
    (r) => r.band === "good" || r.band === "excellent"
  ).length;
  const alertTotal = high + medium + low || 1;

  const alerts: AlertSlice[] = [
    {
      id: "high",
      label: "High",
      count: Math.max(1, Math.round((high / alertTotal) * totalAlerts)),
      color: "#dc2626",
    },
    {
      id: "medium",
      label: "Medium",
      count: Math.max(1, Math.round((medium / alertTotal) * totalAlerts)),
      color: "#f97316",
    },
    {
      id: "low",
      label: "Low",
      count: Math.max(1, Math.round((low / alertTotal) * totalAlerts)),
      color: "#22c55e",
    },
  ];

  const mapPoints: MapPoint[] = countryRows.flatMap((r) => {
    const cities = CITIES_BY_COUNTRY[r.id] ?? [];
    const sample = cities[0];
    if (!sample) return [];
    return [
      {
        id: `${r.id}-${sample.id}`,
        name: r.name,
        chis: r.chis,
        band: r.band,
        lat: sample.lat,
        lon: sample.lon,
      },
    ];
  });

  return {
    kpis: [
      {
        id: "countries",
        label: "Countries monitored",
        value: `${COUNTRIES.length}+`,
        tone: "blue" as const,
      },
      {
        id: "regions",
        label: "Regions analyzed",
        value: `${CITY_COUNT}+`,
        tone: "green" as const,
      },
      {
        id: "children",
        label: "Children in coverage",
        value: "2.4B+",
        tone: "purple" as const,
      },
      {
        id: "alerts",
        label: "Active alerts",
        value: String(totalAlerts),
        tone: "red" as const,
      },
    ],
    highRisk,
    alerts,
    mapPoints,
    sources: TRUSTED_SOURCES.length,
    generatedAt: new Date().toISOString(),
  };
}

/** Deterministic overview metrics for the India CHIS console. */
export function getIndiaOverview() {
  const stateMap = new Map<
    string,
    { chisSum: number; n: number; alerts: number }
  >();

  for (const region of INDIA_REGIONS) {
    const chis = chisFromSeed(
      region.id,
      region.tier === 3 ? -8 : region.tier === 1 ? 4 : 0
    );
    const alerts = region.primaryRisks.length;
    const prev = stateMap.get(region.state) ?? {
      chisSum: 0,
      n: 0,
      alerts: 0,
    };
    prev.chisSum += chis;
    prev.n += 1;
    prev.alerts += alerts;
    stateMap.set(region.state, prev);
  }

  const stateRows: RegionRiskRow[] = [...stateMap.entries()].map(
    ([state, v]) => {
      const chis = Math.round(v.chisSum / v.n);
      return {
        id: state,
        name: state,
        sublabel: `${v.n} region${v.n === 1 ? "" : "s"}`,
        chis,
        band: chisBand(chis),
        trend: trendFromSeed(state),
        alerts: v.alerts,
      };
    }
  );

  const topStates = [...stateRows].sort((a, b) => a.chis - b.chis).slice(0, 5);
  const avgChis =
    stateRows.reduce((s, r) => s + r.chis, 0) / Math.max(1, stateRows.length);

  const trend: TrendPoint[] = [
    "Apr 14",
    "Apr 21",
    "Apr 28",
    "May 5",
    "May 12",
  ].map((label, i) => ({
    label,
    value: Math.round(
      avgChis + Math.sin(i * 1.2) * 12 - 4 + hash01(`trend-${i}`) * 6
    ),
  }));

  const dimensions: DimensionSlice[] = [
    {
      id: "heat",
      label: "Heat",
      score: chisFromSeed("in-heat"),
      color: "#f97316",
    },
    {
      id: "air",
      label: "Air quality",
      score: chisFromSeed("in-air"),
      color: "#0ea5e9",
    },
    {
      id: "water",
      label: "Water quality",
      score: chisFromSeed("in-water"),
      color: "#06b6d4",
    },
    {
      id: "disease",
      label: "Disease",
      score: chisFromSeed("in-disease"),
      color: "#ef4444",
    },
    {
      id: "nutrition",
      label: "Nutrition",
      score: chisFromSeed("in-nutrition"),
      color: "#22c55e",
    },
  ];

  const totalAlerts = stateRows.reduce((s, r) => s + r.alerts, 0);

  const mapPoints: MapPoint[] = INDIA_REGIONS.filter((r) => r.tier <= 2).map(
    (r) => {
      const chis = chisFromSeed(r.id, r.tier === 1 ? 4 : 0);
      return {
        id: r.id,
        name: r.name,
        state: r.state,
        chis,
        band: chisBand(chis),
        lat: r.lat,
        lon: r.lon,
      };
    }
  );

  return {
    kpis: [
      {
        id: "states",
        label: "States monitored",
        value: String(stateRows.length),
        tone: "blue" as const,
      },
      {
        id: "districts",
        label: "Regions monitored",
        value: String(INDIA_REGIONS.length),
        tone: "green" as const,
      },
      {
        id: "children",
        label: "Children in coverage",
        value: "480M+",
        tone: "purple" as const,
      },
      {
        id: "alerts",
        label: "Active alerts",
        value: String(totalAlerts),
        tone: "red" as const,
      },
    ],
    topStates,
    dimensions,
    trend,
    mapPoints,
    avgChis: Math.round(avgChis),
    sources: TRUSTED_SOURCES.length,
    generatedAt: new Date().toISOString(),
  };
}

export type GlobalOverview = ReturnType<typeof getGlobalOverview>;
export type IndiaOverview = ReturnType<typeof getIndiaOverview>;
