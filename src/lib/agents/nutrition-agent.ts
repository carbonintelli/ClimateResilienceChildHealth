import type { ClimateSnapshot, NutritionInsight, RiskLevel } from "../types";

export function analyzeNutrition(climate: ClimateSnapshot): NutritionInsight {
  const maxTemp = Math.max(
    ...climate.forecastDays.slice(0, 5).map((d) => d.tempMaxC)
  );
  const totalRain = climate.forecastDays
    .slice(0, 5)
    .reduce((s, d) => s + d.precipitationMm, 0);
  const drySpell =
    climate.forecastDays.slice(0, 5).every((d) => d.precipitationMm < 2) &&
    maxTemp > 30;

  let risk: RiskLevel = "low";
  let title = "Balanced nutrition outlook";
  let description =
    "Current climate patterns support stable food access with standard hydration needs.";
  let foodSecurityNote =
    "Local markets and school meals are likely unaffected; eat diverse fruits and vegetables.";
  let hydrationLiters = 1.5;
  const recommendedFoods = [
    "Seasonal fruits and vegetables",
    "Whole grains and legumes",
    "Clean drinking water",
  ];
  const avoid: string[] = [];

  if (maxTemp >= 35) {
    risk = "high";
    title = "Heat impacts appetite & hydration";
    description =
      "High heat reduces appetite and increases fluid loss — children need more water and lighter, nutrient-dense meals.";
    foodSecurityNote =
      "Heat waves can spoil food faster; prioritize freshly prepared meals and refrigerated items when power is stable.";
    hydrationLiters = 2.5;
    recommendedFoods.push(
      "Coconut water or oral rehydration if advised",
      "Yogurt, cucumber, watermelon",
      "Small frequent meals"
    );
    avoid.push("Heavy fried foods at midday", "Unrefrigerated leftovers");
  }

  if (totalRain > 120) {
    risk = risk === "high" ? "critical" : "high";
    title = "Flood stress on food systems";
    description =
      "Flooding can disrupt supply chains, contaminate crops, and limit safe cooking fuel.";
    foodSecurityNote =
      "Communities may face temporary shortages; schools and NGOs often distribute fortified biscuits or hot meals — ask caregivers about local programs.";
    recommendedFoods.push(
      "Fortified dry foods stored above flood level",
      "Boiled or bottled water only"
    );
    avoid.push("Street food near flood zones", "Raw vegetables washed in tap water if unsafe");
  }

  if (drySpell) {
    risk = risk === "low" ? "moderate" : risk;
    title = "Drought pressure on crops & prices";
    description =
      "Extended dry heat can reduce harvests and raise food prices, affecting family nutrition budgets.";
    foodSecurityNote =
      "Drought-affected regions may see fewer fresh vegetables; dried beans and lentils offer affordable protein.";
    hydrationLiters = Math.max(hydrationLiters, 2);
    recommendedFoods.push("Dried lentils, eggs, tinned fish (if available)");
  }

  return {
    risk,
    title,
    description,
    foodSecurityNote,
    hydrationLiters,
    recommendedFoods,
    avoid,
  };
}
