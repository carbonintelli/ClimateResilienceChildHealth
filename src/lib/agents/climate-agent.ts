import type { ClimateSnapshot, ForecastDay } from "../types";

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
}

interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weathercode: number[];
}

export async function fetchClimateData(
  lat: number,
  lon: number
): Promise<ClimateSnapshot> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
    daily:
      "temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode",
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { next: { revalidate: 1800 } }
  );

  if (!res.ok) {
    throw new Error(`Climate API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    current: OpenMeteoCurrent;
    daily: OpenMeteoDaily;
  };

  const forecastDays: ForecastDay[] = data.daily.time.map((date, i) => ({
    date,
    tempMaxC: data.daily.temperature_2m_max[i],
    tempMinC: data.daily.temperature_2m_min[i],
    precipitationMm: data.daily.precipitation_sum[i] ?? 0,
    weatherCode: data.daily.weathercode[i],
  }));

  const temp = data.current.temperature_2m;
  const humidity = data.current.relative_humidity_2m;

  let aqi: number | undefined;
  try {
    const aqParams = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "us_aqi",
    });
    const aqRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams}`,
      { next: { revalidate: 3600 } }
    );
    if (aqRes.ok) {
      const aqData = (await aqRes.json()) as {
        current?: { us_aqi?: number };
      };
      aqi = aqData.current?.us_aqi;
    }
  } catch {
    /* air quality optional */
  }

  return {
    temperatureC: temp,
    humidity,
    precipitationMm: data.current.precipitation,
    windSpeedKmh: data.current.wind_speed_10m,
    heatIndex: computeHeatIndex(temp, humidity),
    airQualityIndex: aqi,
    forecastDays,
  };
}

function computeHeatIndex(tempC: number, humidity: number): number {
  const tempF = (tempC * 9) / 5 + 32;
  if (tempF < 80) return tempC;
  const hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity;
  return Math.round((((hi - 32) * 5) / 9) * 10) / 10;
}
