import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgentPipeline } from "@/lib/agents/orchestrator";
import { COUNTRIES, CITY_BY_COUNTRY } from "@/lib/countries";

const bodySchema = z.object({
  countryCode: z.string().length(2),
  lat: z.number().optional(),
  lon: z.number().optional(),
  city: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { countryCode, lat, lon, city: cityOverride } = parsed.data;
    const code = countryCode.toUpperCase();
    const country = COUNTRIES.find((c) => c.code === code);
    const preset = CITY_BY_COUNTRY[code];

    if (!country || !preset) {
      return NextResponse.json(
        { error: "Country not supported in demo registry" },
        { status: 404 }
      );
    }

    const report = await runAgentPipeline({
      country: country.name,
      countryCode: code,
      city: cityOverride ?? preset.city,
      lat: lat ?? preset.lat,
      lon: lon ?? preset.lon,
    });

    return NextResponse.json(report);
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      {
        error: "Agent pipeline failed",
        message: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "KlimaGuard Kids Agent API",
    version: "0.1.0",
    agents: ["climate", "health", "nutrition", "disease", "synthesis"],
    countries: COUNTRIES.length,
  });
}
