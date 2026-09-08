"use client";

import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { GlobalOverviewPanel } from "@/components/dashboard/GlobalOverviewPanel";
import DashboardClient from "./DashboardClient";

export default function DashboardConsole() {
  const searchParams = useSearchParams();
  const analyze = searchParams.get("view") === "analyze";

  return (
    <DashboardShell variant="global">
      {analyze ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70">
            <h2 className="text-lg font-extrabold text-ink">Place analysis</h2>
            <p className="text-sm text-ink/60">
              Run the multi-agent climate-health pipeline for a curated city or
              any place worldwide.
            </p>
          </div>
          <DashboardClient embedded />
        </div>
      ) : (
        <GlobalOverviewPanel />
      )}
    </DashboardShell>
  );
}
