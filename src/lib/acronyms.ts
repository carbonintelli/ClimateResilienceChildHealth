/**
 * Shared glossary for acronyms shown in KlimaGuard Kids UI.
 * Keep short explanations plain-language for caregivers, teachers, and health workers.
 */

export type AcronymEntry = {
  /** Canonical short form (e.g. CHIS) */
  short: string;
  /** Full expansion */
  expansion: string;
  /** One-sentence plain-language meaning */
  explanation: string;
  /** Optional grouping for glossary panels */
  group: "score" | "climate" | "health" | "governance" | "data";
};

export const ACRONYMS: Record<string, AcronymEntry> = {
  CHIS: {
    short: "CHIS",
    expansion: "Child Health Impact Score",
    explanation:
      "A 0–100 child climate-health score. Analyze/report views use burden polarity (higher = more concern). Overview maps show wellbeing (100 − burden; higher = healthier).",
    group: "score",
  },
  CHVI: {
    short: "CHVI",
    expansion: "Child Heat Vulnerability Index",
    explanation:
      "How strongly heat and heatwaves threaten children in this place, based on forecast temperatures and local climate.",
    group: "score",
  },
  CRBS: {
    short: "CRBS",
    expansion: "Child Respiratory Burden Score",
    explanation:
      "How much dirty air raises breathing risk for children, weighted for higher pediatric sensitivity.",
    group: "score",
  },
  WDPI: {
    short: "WDPI",
    expansion: "Waterborne Disease Pressure Index",
    explanation:
      "Risk of diarrhea and other water-linked illness from heavy rain, flooding, and monsoon conditions.",
    group: "score",
  },
  VBDP: {
    short: "VBDP",
    expansion: "Vector-Borne Disease Pressure",
    explanation:
      "Conditions that favor mosquito-borne illness such as dengue or malaria around schools and homes.",
    group: "score",
  },
  CNSI: {
    short: "CNSI",
    expansion: "Climate Nutrition Stress Index",
    explanation:
      "How heat, drought, or floods may disrupt safe food, hydration, and child nutrition.",
    group: "score",
  },
  AQI: {
    short: "AQI",
    expansion: "Air Quality Index",
    explanation:
      "A number summarizing how clean or polluted the outdoor air is. Higher values mean worse air for lungs.",
    group: "climate",
  },
  KPI: {
    short: "KPI",
    expansion: "Key Performance Indicator",
    explanation:
      "A public metric used to track coverage, usage, or investment progress for the product.",
    group: "governance",
  },
  SDG: {
    short: "SDG",
    expansion: "Sustainable Development Goal",
    explanation:
      "One of the United Nations goals for global development — KlimaGuard Kids aligns especially with health, climate, hunger, and education goals.",
    group: "governance",
  },
  WHO: {
    short: "WHO",
    expansion: "World Health Organization",
    explanation:
      "The UN agency that sets global health guidance, including heat–health and water/sanitation advice used by our agents.",
    group: "health",
  },
  WASH: {
    short: "WASH",
    expansion: "Water, Sanitation and Hygiene",
    explanation:
      "Safe drinking water, toilets, and handwashing — critical for preventing climate-linked child diarrhea.",
    group: "health",
  },
  ORS: {
    short: "ORS",
    expansion: "Oral Rehydration Solution",
    explanation:
      "A WHO-recommended sugar–salt drink that replaces fluids lost to diarrhea; use with a caregiver.",
    group: "health",
  },
  CPCB: {
    short: "CPCB",
    expansion: "Central Pollution Control Board",
    explanation:
      "India’s national air-quality authority; our India agents map AQI to CPCB-style categories.",
    group: "data",
  },
  NFHS: {
    short: "NFHS",
    expansion: "National Family Health Survey",
    explanation:
      "India’s large household health survey used as a child-health baseline for CHIS calibration.",
    group: "data",
  },
  IMD: {
    short: "IMD",
    expansion: "India Meteorological Department",
    explanation:
      "India’s official weather service; heatwave thresholds inform the heat dimension of CHIS.",
    group: "data",
  },
  NVBDCP: {
    short: "NVBDCP",
    expansion: "National Vector Borne Disease Control Programme",
    explanation:
      "India’s national programme for dengue, malaria, and other mosquito-borne diseases.",
    group: "health",
  },
  IDSP: {
    short: "IDSP",
    expansion: "Integrated Disease Surveillance Programme",
    explanation:
      "India’s disease surveillance network used to frame outbreak-aware guidance.",
    group: "health",
  },
  NCDC: {
    short: "NCDC",
    expansion: "National Centre for Disease Control",
    explanation:
      "India’s national disease-control centre whose framing informs India agent disease outlook.",
    group: "health",
  },
  API: {
    short: "API",
    expansion: "Application Programming Interface",
    explanation:
      "A machine-readable way for apps and partners to call KlimaGuard Kids services such as /api/analyze.",
    group: "data",
  },
  XP: {
    short: "XP",
    expansion: "Experience Points",
    explanation:
      "Points teens earn in Kids play missions for completing climate-preparedness actions.",
    group: "governance",
  },
  PM25: {
    short: "PM2.5",
    expansion: "Particulate Matter ≤ 2.5 micrometres",
    explanation:
      "Tiny airborne particles that penetrate deep into lungs; a main driver of child respiratory burden.",
    group: "climate",
  },
  CCRI: {
    short: "CCRI",
    expansion: "Children's Climate Risk Index",
    explanation:
      "UNICEF’s index of how climate hazards and child vulnerability combine country by country.",
    group: "governance",
  },
  GDPR: {
    short: "GDPR",
    expansion: "General Data Protection Regulation",
    explanation:
      "European privacy law; referenced for future child-data compliance work.",
    group: "governance",
  },
  COPPA: {
    short: "COPPA",
    expansion: "Children's Online Privacy Protection Act",
    explanation:
      "US law on children’s online privacy; the demo avoids child accounts by design.",
    group: "governance",
  },
};

const GROUP_ORDER: AcronymEntry["group"][] = [
  "score",
  "climate",
  "health",
  "data",
  "governance",
];

export const ACRONYM_GROUP_LABELS: Record<AcronymEntry["group"], string> = {
  score: "Child health scores",
  climate: "Climate & air",
  health: "Health programmes",
  data: "Data & systems",
  governance: "Goals & product",
};

/** Lookup by short form (case-insensitive). Accepts "PM2.5" as "PM25" key via alias. */
export function getAcronym(short: string): AcronymEntry | undefined {
  const key = short.trim().toUpperCase().replace(/\./g, "");
  if (key === "PM25") return ACRONYMS.PM25;
  return ACRONYMS[key] ?? ACRONYMS[short.trim().toUpperCase()];
}

export function acronymTitle(short: string): string {
  const entry = getAcronym(short);
  if (!entry) return short;
  return `${entry.expansion} (${entry.short}): ${entry.explanation}`;
}

export function listAcronyms(
  groups?: AcronymEntry["group"][]
): AcronymEntry[] {
  const allow = groups ? new Set(groups) : null;
  return Object.values(ACRONYMS)
    .filter((e) => !allow || allow.has(e.group))
    .sort((a, b) => {
      const gi =
        GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
      if (gi !== 0) return gi;
      return a.short.localeCompare(b.short);
    });
}
