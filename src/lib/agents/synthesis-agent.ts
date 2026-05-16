import type {
  ChildGuidance,
  ClimateSnapshot,
  DiseaseInsight,
  HealthInsight,
  NutritionInsight,
  RiskLevel,
  SynthesisReport,
} from "../types";
import { TRUSTED_SOURCES } from "../sources";
import { maxHealthRisk } from "./health-agent";

export function correlateInsights(
  climate: ClimateSnapshot,
  health: HealthInsight[],
  nutrition: NutritionInsight,
  disease: DiseaseInsight
): string[] {
  const correlations: string[] = [];
  const maxTemp = Math.max(
    ...climate.forecastDays.slice(0, 5).map((d) => d.tempMaxC)
  );
  const rain = climate.forecastDays
    .slice(0, 5)
    .reduce((s, d) => s + d.precipitationMm, 0);

  if (maxTemp >= 35 && nutrition.hydrationLiters >= 2) {
    correlations.push(
      "Climate Agent + Nutrition Agent: Heat forecast correlates with increased hydration needs and appetite changes — coordinate school water breaks with meal timing."
    );
  }

  if (rain > 80 && disease.conditions.some((c) => c.includes("Diarrheal"))) {
    correlations.push(
      "Climate Agent + Disease Agent: Heavy precipitation aligns with waterborne disease risk — prioritize safe water over raw produce until floodwaters recede."
    );
  }

  if (
    (climate.airQualityIndex ?? 0) >= 100 &&
    health.some((h) => h.category === "respiratory")
  ) {
    correlations.push(
      "Climate Agent + Health Agent: Air quality and respiratory alerts overlap — indoor play and mask guidance should be synchronized for asthmatic children."
    );
  }

  if (
    climate.humidity > 70 &&
    disease.conditions.some((c) => c.includes("Dengue"))
  ) {
    correlations.push(
      "Climate Agent + Disease Agent: Humid conditions support vector breeding — community clean-up of standing water reduces both dengue and local flooding from blocked drains."
    );
  }

  if (correlations.length === 0) {
    correlations.push(
      "Synthesis Agent: All agents report stable cross-signals. Maintain routine preparedness drills and monitor UNICEF/WHO local advisories."
    );
  }

  return correlations;
}

export function buildChildGuidance(
  overallRisk: RiskLevel,
  health: HealthInsight[],
  nutrition: NutritionInsight,
  disruptionWindow: string
): ChildGuidance[] {
  const topHealth = health.sort((a, b) => riskOrder(b.risk) - riskOrder(a.risk))[0];

  return [
    {
      ageBand: "5-8",
      emoji: "🌈",
      headline:
        overallRisk === "low"
          ? "Skies look friendly this week!"
          : "Your weather helpers found something to prepare for",
      simpleExplanation: `In the next few days (${disruptionWindow}), ${topHealth.title.toLowerCase()}. Grown-ups are watching too — you can be a preparedness superhero!`,
      prepareToday: [
        "Pack your water bottle in your bag",
        "Learn where your family meets if school closes",
        "Draw a picture of your safe room at home",
      ],
      askAdultFor: [
        "Help filling your water bottle",
        "Explain the family emergency plan",
        nutrition.hydrationLiters > 2
          ? "Extra water breaks today"
          : "A healthy snack for energy",
      ],
      funFact:
        "Children's bodies use water faster than adults when it's hot — that's why your water bottle is your superpower!",
    },
    {
      ageBand: "9-12",
      emoji: "🛡️",
      headline: "Climate readiness briefing",
      simpleExplanation: `Agents detected ${overallRisk} overall risk for ${disruptionWindow}. ${topHealth.description}`,
      prepareToday: [
        "Check local weather alerts with a caregiver",
        "Review handwashing before meals",
        ...topHealth.actions.slice(0, 2),
      ],
      askAdultFor: [
        "Share school closure or heat-day policies",
        "Safe routes if flooding is possible",
        "Which foods are safest this week",
      ],
    },
    {
      ageBand: "13-17",
      emoji: "🌍",
      headline: "Anticipatory action for your community",
      simpleExplanation: `Multi-agent synthesis indicates ${overallRisk} risk. Nutrition: ${nutrition.title}. Key health focus: ${topHealth.title}.`,
      prepareToday: [
        "Map cooling centers or safe spaces near you",
        "Help younger siblings hydrate",
        "Document local gaps (water, shade at bus stops) for community leaders",
      ],
      askAdultFor: [
        "Volunteer with local climate-health initiatives",
        "Verify vaccine and ORS availability at home",
        "Discuss mental health if extreme events cause anxiety",
      ],
    },
  ];
}

function riskOrder(r: RiskLevel): number {
  return { low: 0, moderate: 1, high: 2, critical: 3 }[r];
}

export function computeOverallRisk(
  healthRisk: RiskLevel,
  nutritionRisk: RiskLevel,
  diseaseRisk: RiskLevel
): RiskLevel {
  const risks = [healthRisk, nutritionRisk, diseaseRisk];
  const order: RiskLevel[] = ["low", "moderate", "high", "critical"];
  let max: RiskLevel = "low";
  for (const r of risks) {
    if (order.indexOf(r) > order.indexOf(max)) max = r;
  }
  return max;
}

export function inferDisruptionWindow(climate: ClimateSnapshot): string {
  const risky = climate.forecastDays.slice(0, 5).filter(
    (d) => d.tempMaxC >= 35 || d.precipitationMm >= 40
  );
  if (risky.length === 0) return "the next 5–7 days";
  const first = risky[0].date;
  const last = risky[risky.length - 1].date;
  return first === last ? first : `${first} to ${last}`;
}

export function assembleReport(
  location: SynthesisReport["location"],
  climate: ClimateSnapshot,
  health: HealthInsight[],
  nutrition: NutritionInsight,
  disease: DiseaseInsight,
  agents: SynthesisReport["agents"]
): SynthesisReport {
  const healthRisk = maxHealthRisk(health);
  const overallRisk = computeOverallRisk(
    healthRisk,
    nutrition.risk,
    disease.risk
  );
  const disruptionWindow = inferDisruptionWindow(climate);
  const correlations = correlateInsights(climate, health, nutrition, disease);

  return {
    location,
    generatedAt: new Date().toISOString(),
    overallRisk,
    disruptionWindow,
    agents,
    climate,
    health,
    nutrition,
    disease,
    childGuidance: buildChildGuidance(
      overallRisk,
      health,
      nutrition,
      disruptionWindow
    ),
    correlations,
    dataProvenance: TRUSTED_SOURCES.map((s) => ({
      ...s,
      lastFetched: new Date().toISOString(),
    })),
  };
}
