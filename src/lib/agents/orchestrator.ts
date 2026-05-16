import type { AgentStatus, SynthesisReport } from "../types";
import { TRUSTED_SOURCES } from "../sources";
import { fetchClimateData } from "./climate-agent";
import { analyzeHealthRisks } from "./health-agent";
import { analyzeNutrition } from "./nutrition-agent";
import { analyzeDiseaseRisks } from "./disease-agent";
import { assembleReport } from "./synthesis-agent";

function sourceFor(id: string) {
  return (
    TRUSTED_SOURCES.find((s) => s.id === id) ?? TRUSTED_SOURCES[0]
  );
}

export async function runAgentPipeline(params: {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lon: number;
}): Promise<SynthesisReport> {
  const agents: AgentStatus[] = [
    {
      id: "climate",
      name: "Climate Data Agent",
      role: "Fetches authenticated Open-Meteo weather & air quality feeds",
      status: "fetching",
      source: sourceFor("open-meteo"),
    },
    {
      id: "health",
      name: "Health Risk Agent",
      role: "Maps climate signals to child health stressors (WHO-aligned)",
      status: "idle",
      source: sourceFor("who-guidance"),
    },
    {
      id: "nutrition",
      name: "Nutrition & Food Security Agent",
      role: "Infers hydration, food safety, and scarcity patterns",
      status: "idle",
      source: sourceFor("unicef-climate"),
    },
    {
      id: "disease",
      name: "Disease Outlook Agent",
      role: "Correlates vectors, waterborne, and heat-related illness risk",
      status: "idle",
      source: sourceFor("who-guidance"),
    },
    {
      id: "synthesis",
      name: "Synthesis & Guidance Agent",
      role: "Multi-agent correlation and age-appropriate child guidance",
      status: "idle",
      source: sourceFor("unicef-climate"),
    },
  ];

  let climate;
  try {
    climate = await fetchClimateData(params.lat, params.lon);
    agents[0].status = "complete";
    agents[0].summary = `Live feed: ${climate.temperatureC}°C, ${climate.forecastDays.length}-day forecast`;
  } catch (e) {
    agents[0].status = "error";
    agents[0].summary = e instanceof Error ? e.message : "Climate fetch failed";
    throw e;
  }

  agents[1].status = "analyzing";
  const health = analyzeHealthRisks(climate);
  agents[1].status = "complete";
  agents[1].summary = `${health.length} health signal(s) identified`;

  agents[2].status = "analyzing";
  const nutrition = analyzeNutrition(climate);
  agents[2].status = "complete";
  agents[2].summary = nutrition.title;

  agents[3].status = "analyzing";
  const disease = analyzeDiseaseRisks(climate);
  agents[3].status = "complete";
  agents[3].summary = `${disease.conditions.length} condition(s) in outlook`;

  agents[4].status = "analyzing";
  const report = assembleReport(
    {
      country: params.country,
      countryCode: params.countryCode,
      city: params.city,
      lat: params.lat,
      lon: params.lon,
    },
    climate,
    health,
    nutrition,
    disease,
    agents
  );

  const finalAgents = agents.map((a) =>
    a.id === "synthesis"
      ? {
          ...a,
          status: "complete" as const,
          summary: `${report.correlations.length} cross-agent correlation(s)`,
        }
      : a
  );

  return { ...report, agents: finalAgents };
}
