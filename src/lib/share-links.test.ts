import { describe, expect, it } from "vitest";
import {
  buildPlayPath,
  buildReportSharePath,
  buildRiskRowAnalyzeHref,
} from "./share-links";
import type { SynthesisReport } from "./types";

function fixture(
  location: SynthesisReport["location"],
  indiaRegional?: SynthesisReport["indiaRegional"]
): SynthesisReport {
  return {
    location,
    indiaRegional,
  } as SynthesisReport;
}

describe("buildReportSharePath", () => {
  it("opens dashboard Analyze with custom coords for global reports", () => {
    const path = buildReportSharePath(
      fixture({
        country: "Bangladesh",
        countryCode: "BD",
        city: "Dhaka",
        lat: 23.8,
        lon: 90.4,
      })
    );
    expect(path).toContain("/dashboard?");
    expect(path).toContain("view=analyze");
    expect(path).toContain("mode=custom");
    expect(path).toContain("countryCode=BD");
    expect(path).toContain("city=Dhaka");
  });

  it("opens India Analyze with regionId when India regional context exists", () => {
    const path = buildReportSharePath(
      fixture(
        {
          country: "India",
          countryCode: "IN",
          city: "Delhi",
          lat: 28.6,
          lon: 77.2,
        },
        {
          regionId: "delhi-ncr",
          regionName: "Delhi NCR",
          state: "Delhi",
          climateZone: "semi-arid",
          risk: "high",
          childPopulationShare: 0.3,
          inMonsoonSeason: false,
          zoneDescription: "d",
          seasonalNotes: [],
          activeRegionalRisks: [],
          regionalActions: [],
          contextSummary: "c",
        } as SynthesisReport["indiaRegional"]
      )
    );
    expect(path).toContain("/india?");
    expect(path).toContain("view=analyze");
    expect(path).toContain("regionId=delhi-ncr");
  });
});

describe("buildPlayPath", () => {
  it("includes place and age query params", () => {
    expect(
      buildPlayPath({
        countryCode: "IN",
        regionId: "mumbai",
        ageBand: "9-12",
      })
    ).toBe("/play?countryCode=IN&regionId=mumbai&ageBand=9-12");
  });
});

describe("buildRiskRowAnalyzeHref", () => {
  it("builds curated country analyze links for global rows", () => {
    expect(buildRiskRowAnalyzeHref("global", "BD")).toBe(
      "/dashboard?view=analyze&mode=curated&countryCode=BD"
    );
  });

  it("builds India region analyze links", () => {
    expect(buildRiskRowAnalyzeHref("india", "Maharashtra", "mumbai")).toBe(
      "/india?view=analyze&regionId=mumbai"
    );
  });
});
