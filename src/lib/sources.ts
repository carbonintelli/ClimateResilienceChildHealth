import type { DataSource } from "./types";

/** Authenticated / trusted public data feeds used by agent pipeline */
export const TRUSTED_SOURCES: DataSource[] = [
  {
    id: "open-meteo",
    name: "Open-Meteo Forecast API",
    url: "https://open-meteo.com/en/docs",
    authenticated: false,
  },
  {
    id: "open-meteo-air",
    name: "Open-Meteo Air Quality API",
    url: "https://open-meteo.com/en/docs/air-quality-api",
    authenticated: false,
  },
  {
    id: "who-guidance",
    name: "WHO Climate & Health Guidance (reference)",
    url: "https://www.who.int/health-topics/climate-change",
    authenticated: false,
  },
  {
    id: "unicef-climate",
    name: "UNICEF Climate & Environment",
    url: "https://www.unicef.org/climate-and-environment",
    authenticated: false,
  },
];
