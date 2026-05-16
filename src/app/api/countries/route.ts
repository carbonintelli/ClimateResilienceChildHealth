import { NextResponse } from "next/server";
import { COUNTRIES, CITY_BY_COUNTRY } from "@/lib/countries";

export async function GET() {
  return NextResponse.json(
    COUNTRIES.map((c) => ({
      ...c,
      defaultCity: CITY_BY_COUNTRY[c.code]?.city,
      lat: CITY_BY_COUNTRY[c.code]?.lat,
      lon: CITY_BY_COUNTRY[c.code]?.lon,
    }))
  );
}
