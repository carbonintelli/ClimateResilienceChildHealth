import type { ClimateSnapshot, HealthInsight, RiskLevel } from "../types";

export function analyzeHealthRisks(climate: ClimateSnapshot): HealthInsight[] {
  const insights: HealthInsight[] = [];
  const maxTemp = Math.max(
    ...climate.forecastDays.slice(0, 5).map((d) => d.tempMaxC)
  );
  const totalRain = climate.forecastDays
    .slice(0, 5)
    .reduce((s, d) => s + d.precipitationMm, 0);
  const heatIndex = climate.heatIndex ?? climate.temperatureC;
  const aqi = climate.airQualityIndex ?? 50;

  if (heatIndex >= 35 || maxTemp >= 38) {
    insights.push({
      category: "heat",
      risk: heatIndex >= 40 ? "critical" : "high",
      title: "Extreme heat stress",
      description:
        "Rising temperatures increase dehydration, heat exhaustion, and strain on children with smaller bodies and less ability to regulate heat.",
      actions: [
        "Drink water every hour during outdoor play",
        "Stay in shaded or cooled spaces 11am–4pm",
        "Wear light cotton clothing and a hat",
        "Watch for dizziness, headache, or nausea",
      ],
    });
  } else if (maxTemp >= 32) {
    insights.push({
      category: "heat",
      risk: "moderate",
      title: "Elevated heat advisory",
      description:
        "Warm conditions may affect outdoor activities and hydration needs for children.",
      actions: [
        "Carry a water bottle",
        "Take breaks in the shade",
        "Limit strenuous play at midday",
      ],
    });
  }

  if (aqi >= 100) {
    insights.push({
      category: "respiratory",
      risk: aqi >= 150 ? "high" : "moderate",
      title: "Poor air quality",
      description:
        "Air pollution can worsen asthma and respiratory infections in children.",
      actions: [
        "Reduce outdoor exercise when air looks hazy",
        "Keep windows closed if indoor air is cleaner",
        "Use masks if advised by local health authorities",
        "Follow school outdoor activity guidance",
      ],
    });
  }

  if (totalRain > 80) {
    insights.push({
      category: "water",
      risk: totalRain > 150 ? "high" : "moderate",
      title: "Flood & water contamination risk",
      description:
        "Heavy rainfall may flood low areas and contaminate drinking water sources.",
      actions: [
        "Boil or use safe water if taps are unclear",
        "Avoid playing in floodwater",
        "Know your family's evacuation meeting point",
        "Keep emergency snacks in a dry bag",
      ],
    });
  }

  if (
    climate.humidity > 70 &&
    climate.temperatureC > 22 &&
    totalRain < 30
  ) {
    insights.push({
      category: "vector",
      risk: "moderate",
      title: "Mosquito-borne disease conditions",
      description:
        "Warm, humid weather supports mosquitoes that can spread dengue, malaria, and other diseases.",
      actions: [
        "Use bed nets where recommended",
        "Remove standing water near home",
        "Wear long sleeves at dusk if local alerts exist",
        "Report fever to a caregiver immediately",
      ],
    });
  }

  if (insights.length === 0) {
    insights.push({
      category: "mental",
      risk: "low",
      title: "Stable conditions",
      description:
        "No major climate-health stressors detected in the next few days. Continue healthy routines.",
      actions: [
        "Maintain regular sleep and meals",
        "Stay informed through local alerts",
        "Practice your family emergency plan once a month",
      ],
    });
  }

  return insights;
}

export function maxHealthRisk(insights: HealthInsight[]): RiskLevel {
  const order: RiskLevel[] = ["low", "moderate", "high", "critical"];
  let max: RiskLevel = "low";
  for (const i of insights) {
    if (order.indexOf(i.risk) > order.indexOf(max)) max = i.risk;
  }
  return max;
}
