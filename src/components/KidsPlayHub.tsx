"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  AgeBand,
  ChildGuidance,
  CityPreset,
  CountryOption,
  SynthesisReport,
} from "@/lib/types";
import {
  AGE_PROFILES,
  categoryLabel,
  completeMission,
  computeLevel,
  getBadgesForAge,
  loadProgress,
  resetProgress,
  resolveMissions,
  type AgeGameProfile,
} from "@/lib/gamification";
import { AGE_BAND_VISUALS } from "@/lib/age-band-visuals";
import { AgeBandPicker } from "@/components/AgeBandPicker";
import { CountrySelector } from "@/components/CountrySelector";
import { CitySelector } from "@/components/CitySelector";
import { IndiaRegionSelector } from "@/components/IndiaRegionSelector";
import { INDIA_REGIONS } from "@/lib/india-regions";
import {
  CheckCircle2,
  Circle,
  Flame,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";

export function KidsPlayHub() {
  const searchParams = useSearchParams();
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [progress, setProgress] = useState(() =>
    ageBand ? loadProgress(ageBand) : null
  );
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [countryCode, setCountryCode] = useState("BD");
  const [cityId, setCityId] = useState("dhaka");
  const [regionId, setRegionId] = useState("delhi-ncr");
  const [report, setReport] = useState<SynthesisReport | null>(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [climateError, setClimateError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const isIndia = countryCode === "IN";

  // Prefill from Report → Play deep-link
  useEffect(() => {
    const code = searchParams.get("countryCode");
    const nextCity = searchParams.get("cityId");
    const nextRegion = searchParams.get("regionId");
    const nextAge = searchParams.get("ageBand");
    if (code) setCountryCode(code.toUpperCase());
    if (nextCity) setCityId(nextCity);
    if (nextRegion) setRegionId(nextRegion);
    if (nextAge === "5-8" || nextAge === "9-12" || nextAge === "13-17") {
      setAgeBand(nextAge);
    }
  }, [searchParams]);

  const citiesForCountry: CityPreset[] = useMemo(() => {
    return countries.find((c) => c.code === countryCode)?.cities ?? [];
  }, [countries, countryCode]);

  useEffect(() => {
    fetch("/api/countries")
      .then((r) => r.json())
      .then((data: { countries?: CountryOption[] } | CountryOption[]) => {
        const list = Array.isArray(data) ? data : data.countries ?? [];
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (isIndia || !citiesForCountry.length) return;
    if (!citiesForCountry.find((c) => c.id === cityId)) {
      setCityId(citiesForCountry[0].id);
    }
  }, [citiesForCountry, cityId, isIndia]);

  useEffect(() => {
    if (!ageBand) {
      setProgress(null);
      return;
    }
    setProgress(loadProgress(ageBand));
  }, [ageBand]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const guidance: ChildGuidance | null = useMemo(() => {
    if (!ageBand || !report) return null;
    return report.childGuidance.find((g) => g.ageBand === ageBand) ?? null;
  }, [ageBand, report]);

  const missions = useMemo(() => {
    if (!ageBand) return [];
    return resolveMissions(ageBand, guidance);
  }, [ageBand, guidance]);

  const profile: AgeGameProfile | null = ageBand ? AGE_PROFILES[ageBand] : null;
  const visual = ageBand ? AGE_BAND_VISUALS[ageBand] : null;
  const level = progress && ageBand ? computeLevel(ageBand, progress.xp) : null;
  const badges = ageBand ? getBadgesForAge(ageBand) : [];

  const loadClimateMissions = useCallback(async () => {
    setLoadingClimate(true);
    setClimateError(null);
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
      if (!res.ok) throw new Error(data.message ?? data.error ?? "Could not load climate");
      setReport(data as SynthesisReport);
      setToast("Climate missions unlocked for your age group!");
    } catch (e) {
      setClimateError(e instanceof Error ? e.message : "Could not load climate");
    } finally {
      setLoadingClimate(false);
    }
  }, [countryCode, isIndia, regionId, cityId]);

  const onCountryChange = (code: string) => {
    setCountryCode(code);
    setReport(null);
    const next = countries.find((c) => c.code === code);
    if (code !== "IN" && next?.cities?.length) {
      setCityId(next.cities[0].id);
    }
  };

  const onComplete = (missionId: string) => {
    if (!ageBand || !progress || !profile) return;
    const mission = missions.find((m) => m.id === missionId);
    if (!mission) return;
    const result = completeMission(progress, mission, missions);
    setProgress(result.progress);
    if (result.gainedXp > 0) {
      setCelebrating(true);
      window.setTimeout(() => setCelebrating(false), 900);
      const badgeNames = result.newlyUnlocked.map((b) => b.name).join(", ");
      setToast(
        badgeNames
          ? `${profile.celebration} +${result.gainedXp} ${profile.currencyName}. Badge: ${badgeNames}`
          : `${profile.celebration} +${result.gainedXp} ${profile.currencyName}`
      );
    }
  };

  const onReset = () => {
    if (!ageBand) return;
    if (!window.confirm("Reset your progress for this age group?")) return;
    setProgress(resetProgress(ageBand));
    setToast("Progress reset for this age group.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-100 bg-white/90 p-6 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-widest text-ocean">
          Kids play mode
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
          Climate quests by age
        </h1>
        <p className="mt-3 max-w-2xl text-ink/70">
          Pick your age group to unlock missions that match how you learn —
          stars for younger heroes, points for cadets, and impact XP for teen
          leaders. Progress stays on this device.
        </p>
        <div className="mt-6">
          <AgeBandPicker value={ageBand} onChange={setAgeBand} />
        </div>
      </section>

      {!ageBand && (
        <p className="text-center text-ink/60 font-medium">
          Choose an age group above to start playing.
        </p>
      )}

      {ageBand && profile && progress && level && visual && (
        <>
          <section
            className={`overflow-hidden rounded-3xl border border-sky-100 shadow-lg transition-transform ${
              celebrating ? "game-pop" : ""
            }`}
          >
            <div className="grid md:grid-cols-[1.05fr_0.95fr]">
              <div
                className={`bg-gradient-to-br ${visual.accentClass} p-6 sm:p-7`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-ocean">
                  {visual.badgeLabel} · Ages {ageBand}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                  {visual.headline}
                </h2>
                <p className="mt-2 text-sm text-ink/70">{visual.tagline}</p>
                <p className="mt-4 text-sm font-semibold text-ink">
                  {level.title} · Level {level.level}
                </p>
                <p className="mt-1 text-sm text-ink/65">
                  {progress.xp} {profile.currencyEmoji} {profile.currencyName}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-saffron/15 px-3 py-2 text-sm font-bold text-saffron">
                    <Flame className="h-4 w-4" />
                    {progress.streakDays} day streak
                  </span>
                  <button
                    type="button"
                    onClick={onReset}
                    className="inline-flex items-center gap-1 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-xs font-semibold text-ink/60 hover:bg-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgeBand(null)}
                    className="rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-xs font-semibold text-ink/60 hover:bg-white"
                  >
                    Change age
                  </button>
                </div>
                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs font-semibold text-ink/50">
                    <span>
                      {level.xpIntoLevel}/{level.xpForNext} to next level
                    </span>
                    <span>
                      {progress.completedMissionIds.length} missions done
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ocean to-leaf transition-all duration-500"
                      style={{ width: `${Math.round(level.progress * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="relative min-h-[200px]">
                <Image
                  src={visual.imageSrc}
                  alt={visual.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-3">
            {visual.scenes
              .filter((s) => s.id !== "hero")
              .map((scene) => (
                <figure
                  key={scene.id}
                  className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={scene.imageSrc}
                      alt={scene.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, 280px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-ocean">
                      {scene.tipTitle}
                    </p>
                    <p className="mt-1 text-xs text-ink/70">{scene.caption}</p>
                  </figcaption>
                </figure>
              ))}
          </section>

          <section className="rounded-3xl border border-sky-100 bg-white p-6 shadow-md">
            <h3 className="flex items-center gap-2 font-extrabold text-ink">
              <MapPin className="h-5 w-5 text-ocean" />
              Power missions with live climate
            </h3>
            <p className="mt-2 text-sm text-ink/65">
              Optional: load your area so quests match the real weather and
              health risks right now. Or skip and play the starter missions.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <CountrySelector
                countries={countries}
                value={countryCode}
                onChange={onCountryChange}
              />
              {isIndia ? (
                <IndiaRegionSelector
                  regions={INDIA_REGIONS}
                  value={regionId}
                  onChange={setRegionId}
                />
              ) : (
                <CitySelector
                  cities={citiesForCountry}
                  value={cityId}
                  onChange={setCityId}
                />
              )}
            </div>
            <button
              type="button"
              onClick={loadClimateMissions}
              disabled={loadingClimate}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-ocean px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-600 disabled:opacity-60"
            >
              {loadingClimate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {report ? "Refresh climate missions" : "Unlock climate missions"}
            </button>
            {climateError && (
              <p className="mt-2 text-sm text-coral">{climateError}</p>
            )}
            {guidance && (
              <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-ink/75">
                <strong>{guidance.headline}</strong> — {guidance.simpleExplanation}
              </p>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-extrabold text-ink">
                Today&apos;s missions
              </h3>
              <span className="text-xs font-semibold text-ink/50">
                {missions.some((m) => m.source === "climate")
                  ? "Climate-powered"
                  : "Starter pack"}
              </span>
            </div>
            <ul className="space-y-3">
              {missions.map((mission) => {
                const done = progress.completedMissionIds.includes(mission.id);
                return (
                  <li key={mission.id}>
                    <button
                      type="button"
                      onClick={() => !done && onComplete(mission.id)}
                      disabled={done}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all ${
                        done
                          ? "border-leaf/40 bg-leaf/10 opacity-90"
                          : "border-sky-100 bg-white hover:border-ocean/50 hover:shadow-md"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-leaf" />
                      ) : (
                        <Circle className="mt-0.5 h-6 w-6 shrink-0 text-ocean/50" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold text-ink">{mission.title}</p>
                          <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold uppercase text-ocean">
                            {categoryLabel(mission.category)}
                          </span>
                          <span className="rounded-lg bg-sun/20 px-2 py-0.5 text-[11px] font-bold text-saffron">
                            +{mission.xp} {profile.currencyName}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink/70">
                          {mission.description}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-ink">
              <Trophy className="h-5 w-5 text-sun" />
              Badges
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map((badge) => {
                const unlocked = progress.unlockedBadgeIds.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border px-4 py-4 transition-all ${
                      unlocked
                        ? "border-sun/40 bg-sun/10 game-badge-in"
                        : "border-sky-100 bg-white/70 opacity-55"
                    }`}
                  >
                    <span className="text-2xl" aria-hidden>
                      {badge.emoji}
                    </span>
                    <p className="mt-2 font-extrabold text-ink">{badge.name}</p>
                    <p className="mt-1 text-xs text-ink/65">{badge.description}</p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-ink/45">
                      {unlocked ? "Unlocked" : "Locked"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl game-toast"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
