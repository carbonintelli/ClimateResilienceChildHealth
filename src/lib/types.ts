export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type AgentId =
  | "climate"
  | "health"
  | "nutrition"
  | "disease"
  | "synthesis";

export interface DataSource {
  id: string;
  name: string;
  url: string;
  authenticated: boolean;
  lastFetched?: string;
}

export interface AgentStatus {
  id: AgentId;
  name: string;
  role: string;
  status: "idle" | "fetching" | "analyzing" | "complete" | "error";
  source: DataSource;
  summary?: string;
}

export interface ClimateSnapshot {
  temperatureC: number;
  humidity: number;
  precipitationMm: number;
  windSpeedKmh: number;
  heatIndex?: number;
  airQualityIndex?: number;
  forecastDays: ForecastDay[];
}

export interface ForecastDay {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  weatherCode: number;
}

export interface HealthInsight {
  category: "heat" | "respiratory" | "vector" | "water" | "mental";
  risk: RiskLevel;
  title: string;
  description: string;
  actions: string[];
}

export interface NutritionInsight {
  risk: RiskLevel;
  title: string;
  description: string;
  foodSecurityNote: string;
  hydrationLiters: number;
  recommendedFoods: string[];
  avoid: string[];
}

export interface DiseaseInsight {
  risk: RiskLevel;
  conditions: string[];
  symptoms: string[];
  prevention: string[];
}

export interface ChildGuidance {
  headline: string;
  emoji: string;
  ageBand: "5-8" | "9-12" | "13-17";
  simpleExplanation: string;
  prepareToday: string[];
  askAdultFor: string[];
  funFact?: string;
}

export interface SynthesisReport {
  location: { country: string; countryCode: string; city: string; lat: number; lon: number };
  generatedAt: string;
  overallRisk: RiskLevel;
  disruptionWindow: string;
  agents: AgentStatus[];
  climate: ClimateSnapshot;
  health: HealthInsight[];
  nutrition: NutritionInsight;
  disease: DiseaseInsight;
  childGuidance: ChildGuidance[];
  correlations: string[];
  dataProvenance: DataSource[];
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}
