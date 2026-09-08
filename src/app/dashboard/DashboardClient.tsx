"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CityPreset, CountryOption, SynthesisReport } from "@/lib/types";
import { INDIA_REGIONS } from "@/lib/india-regions";
import { CountrySelector } from "@/components/CountrySelector";
import { CitySelector } from "@/components/CitySelector";
import { IndiaRegionSelector } from "@/components/IndiaRegionSelector";
import {
  LocationSearch,
  type PlaceSelection,
} from "@/components/LocationSearch";
import { Logo } from "@/components/Logo";
import { ReportView } from "@/components/ReportView";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type CountriesResponse = {
  count?: {
    countries: number;
    cities: number;
    byTier?: { 1: number; 2: number; 3: number };
    trustedSources?: number;
  };
  countries: CountryOption[];
};

type LocationMode = "curated" | "anywhere";

export default function DashboardClient({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [registryCounts, setRegistryCounts] = useState<{
    countries: number;
    cities: number;
    byTier?: { 1: number; 2: number; 3: number };
    trustedSources?: number;
  }>({
    countries: 0,
    cities: 0,
  });
  const [mode, setMode] = useState<LocationMode>("curated");
  const [countryCode, setCountryCode] = useState("BD");
  const [cityId, setCityId] = useState("dhaka");
  const [regionId, setRegionId] = useState("delhi-ncr");
  const [customPlace, setCustomPlace] = useState<PlaceSelection | null>(null);
  const [report, setReport] = useState<SynthesisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrappedShare, setBootstrappedShare] = useState(false);

  const isIndia = countryCode === "IN";

  const citiesForCountry: CityPreset[] = useMemo(() => {
    const match = countries.find((c) => c.code === countryCode);
    return match?.cities ?? [];
  }, [countries, countryCode]);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((data: CountriesResponse | CountryOption[]) => {
        const list = Array.isArray(data) ? data : data.countries;
        const counts = Array.isArray(data)
          ? { countries: list.length, cities: 0 }
          : data.count ?? { countries: list.length, cities: 0 };
        setCountries(list);
        setRegistryCounts(counts);
        if (list.length && !list.find((c) => c.code === countryCode)) {
          setCountryCode(list[0].code);
        }
      })
      .catch(() => setError("Could not load countries"));
  }, [countryCode]);

  useEffect(() => {
    if (isIndia || mode === "anywhere") return;
    if (!citiesForCountry.length) return;
    if (!citiesForCountry.find((c) => c.id === cityId)) {
      setCityId(citiesForCountry[0].id);
    }
  }, [citiesForCountry, cityId, isIndia, mode]);

  const runCustomAnalysis = useCallback(async (place: PlaceSelection) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: place.countryCode,
          country: place.country,
          city: place.name,
          lat: place.lat,
          lon: place.lon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Analysis failed");
      setReport(data as SynthesisReport);

      const url = new URL(window.location.href);
      url.searchParams.set("mode", "custom");
      url.searchParams.set("countryCode", place.countryCode);
      url.searchParams.set("country", place.country);
      url.searchParams.set("city", place.name);
      url.searchParams.set("lat", String(place.lat));
      url.searchParams.set("lon", String(place.lon));
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const runCuratedAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const body: {
        countryCode: string;
        regionId?: string;
        cityId?: string;
      } = { countryCode };
      if (isIndia) body.regionId = regionId;
      else body.cityId = cityId;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Analysis failed");
      setReport(data as SynthesisReport);

      const url = new URL(window.location.href);
      url.searchParams.set("mode", "curated");
      url.searchParams.set("countryCode", countryCode);
      if (isIndia) {
        url.searchParams.set("regionId", regionId);
        url.searchParams.delete("cityId");
      } else {
        url.searchParams.set("cityId", cityId);
        url.searchParams.delete("regionId");
      }
      url.searchParams.delete("city");
      url.searchParams.delete("lat");
      url.searchParams.delete("lon");
      url.searchParams.delete("country");
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [countryCode, isIndia, regionId, cityId, router]);

  // Open shared / deep-linked location once
  useEffect(() => {
    if (bootstrappedShare) return;
    const modeParam = searchParams.get("mode");
    if (modeParam === "custom") {
      const code = searchParams.get("countryCode");
      const country = searchParams.get("country");
      const city = searchParams.get("city");
      const lat = Number(searchParams.get("lat"));
      const lon = Number(searchParams.get("lon"));
      if (city && Number.isFinite(lat) && Number.isFinite(lon)) {
        const resolvedCode = (code || "XX").toUpperCase();
        const place: PlaceSelection = {
          name: city,
          label: `${city}, ${country ?? code ?? "Custom"}`,
          countryCode: resolvedCode,
          country: country ?? code ?? "Custom",
          lat,
          lon,
        };
        setMode("anywhere");
        setCustomPlace(place);
        setBootstrappedShare(true);
        void runCustomAnalysis(place);
        return;
      }
    }
    if (modeParam === "curated") {
      const code = searchParams.get("countryCode");
      const nextCity = searchParams.get("cityId");
      const nextRegion = searchParams.get("regionId");
      if (code) setCountryCode(code.toUpperCase());
      if (nextCity) setCityId(nextCity);
      if (nextRegion) setRegionId(nextRegion);
      setMode("curated");
    }
    setBootstrappedShare(true);
  }, [bootstrappedShare, searchParams, runCustomAnalysis]);

  const onCountryChange = (code: string) => {
    setCountryCode(code);
    setReport(null);
    const next = countries.find((c) => c.code === code);
    if (code !== "IN" && next?.cities?.length) {
      setCityId(next.cities[0].id);
    }
  };

  const runAnalysis = () => {
    if (mode === "anywhere") {
      if (!customPlace) {
        setError("Search and select a place first.");
        return;
      }
      void runCustomAnalysis(customPlace);
      return;
    }
    void runCuratedAnalysis();
  };

  return (
    <div className={embedded ? "space-y-6" : "mx-auto max-w-6xl px-4 py-10"}>
      {!embedded ? (
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold text-ink">
            <Logo size={56} />
            Global climate-health dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-ink/70">
            Analyze a curated climate-vulnerable city, or search{" "}
            <strong>any city or country worldwide</strong>
            {registryCounts.countries
              ? ` · registry covers ${registryCounts.countries} countries / ${registryCounts.cities} cities`
              : ""}
            {registryCounts.trustedSources
              ? ` · ${registryCounts.trustedSources} validated sources`
              : ""}
            . Share a link to reopen the same place and guidance.
          </p>
          {isIndia && mode === "curated" && (
            <Link
              href="/india"
              className="mt-3 inline-block text-sm font-bold text-saffron hover:underline"
            >
              → Open dedicated India dashboard with full impact panel
            </Link>
          )}
        </div>
      ) : null}

      <div className="max-w-xl rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
        <div
          role="tablist"
          aria-label="Location mode"
          className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-sky-50 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "curated"}
            disabled={loading}
            onClick={() => {
              setMode("curated");
              setError(null);
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              mode === "curated"
                ? "bg-white text-ocean shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Curated cities
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "anywhere"}
            disabled={loading}
            onClick={() => {
              setMode("anywhere");
              setError(null);
            }}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
              mode === "anywhere"
                ? "bg-white text-ocean shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Any place
          </button>
        </div>

        {mode === "curated" ? (
          <>
            <CountrySelector
              countries={
                countries.length
                  ? countries
                  : [{ code: "BD", name: "Bangladesh", flag: "🇧🇩" }]
              }
              value={countryCode}
              onChange={onCountryChange}
              disabled={loading}
            />
            {isIndia ? (
              <div className="mt-4">
                <IndiaRegionSelector
                  regions={INDIA_REGIONS}
                  value={regionId}
                  onChange={setRegionId}
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="mt-4">
                <CitySelector
                  cities={citiesForCountry}
                  value={cityId}
                  onChange={setCityId}
                  disabled={loading}
                />
              </div>
            )}
          </>
        ) : (
          <LocationSearch
            disabled={loading}
            selected={customPlace}
            onSelect={(place) => {
              setCustomPlace(place);
              setReport(null);
              setError(null);
            }}
          />
        )}

        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading || (mode === "anywhere" && !customPlace)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-ocean py-3.5 font-extrabold text-white shadow-sm transition-[transform,background-color] duration-150 hover:bg-sky-600 active:scale-[0.99] disabled:opacity-55"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Agents working…
            </>
          ) : mode === "anywhere" ? (
            "Analyze this place"
          ) : (
            "Run agentic analysis"
          )}
        </button>
        {error && (
          <p className="mt-3 text-sm font-medium text-coral">{error}</p>
        )}
      </div>

      {report && (
        <div className="mt-10">
          <ReportView
            report={report}
            showIndiaPanel={report.location.countryCode === "IN"}
          />
        </div>
      )}
    </div>
  );
}
