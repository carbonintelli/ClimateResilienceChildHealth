import type { ClimateSnapshot, DiseaseInsight, RiskLevel } from "../types";

export function analyzeDiseaseRisks(climate: ClimateSnapshot): DiseaseInsight {
  const maxTemp = Math.max(
    ...climate.forecastDays.slice(0, 5).map((d) => d.tempMaxC)
  );
  const totalRain = climate.forecastDays
    .slice(0, 5)
    .reduce((s, d) => s + d.precipitationMm, 0);
  const humid = climate.humidity > 65;
  const conditions: string[] = [];
  const symptoms: string[] = [];
  const prevention: string[] = [];
  let risk: RiskLevel = "low";

  if (maxTemp >= 38) {
    conditions.push("Heat exhaustion", "Dehydration");
    symptoms.push("High fever", "Dry mouth", "Confusion or fainting");
    prevention.push(
      "Never leave children in closed vehicles",
      "Schedule outdoor play for cooler hours"
    );
    risk = "high";
  }

  if (totalRain > 80) {
    conditions.push(
      "Diarrheal disease (contaminated water)",
      "Leptospirosis (floodwater exposure)",
      "Skin infections"
    );
    symptoms.push("Stomach pain", "Diarrhea", "Skin rashes after water contact");
    prevention.push(
      "Handwashing with soap after touching floodwater",
      "Vaccinate per national schedule (cholera where offered)"
    );
    risk = elevate(risk, "high");
  }

  if (humid && climate.temperatureC > 20 && totalRain > 20) {
    conditions.push("Dengue", "Malaria (in endemic zones)", "Chikungunya");
    symptoms.push("Sudden fever", "Joint pain", "Rash");
    prevention.push(
      "Use insect repellent as locally recommended",
      "Sleep under treated nets in outbreak seasons",
      "Seek care within 24 hours of fever in endemic areas"
    );
    risk = elevate(risk, "moderate");
  }

  if ((climate.airQualityIndex ?? 0) >= 120) {
    conditions.push("Respiratory infections", "Asthma exacerbation");
    symptoms.push("Wheezing", "Persistent cough", "Chest tightness");
    prevention.push(
      "Follow local air quality alerts",
      "Keep rescue inhalers accessible for asthmatic children"
    );
    risk = elevate(risk, "moderate");
  }

  if (conditions.length === 0) {
    conditions.push("Routine childhood illnesses");
    symptoms.push("Mild fever", "Runny nose");
    prevention.push(
      "Complete immunizations",
      "Wash hands before meals",
      "Stay home when sick to protect friends"
    );
  }

  return { risk, conditions, symptoms, prevention };
}

function elevate(current: RiskLevel, next: RiskLevel): RiskLevel {
  const order: RiskLevel[] = ["low", "moderate", "high", "critical"];
  return order.indexOf(next) > order.indexOf(current) ? next : current;
}
