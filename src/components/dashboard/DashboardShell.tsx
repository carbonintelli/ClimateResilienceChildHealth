"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Globe2,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PoweredBySustainow } from "@/components/SustainowWordmark";
import { Abbr } from "@/components/Abbr";

type NavItem = {
  id: string;
  label: React.ReactNode;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const GLOBAL_NAV: NavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "map", label: "Global map", href: "/dashboard#chis-map", icon: Globe2 },
  {
    id: "chis",
    label: (
      <>
        <Abbr of="CHIS" /> index
      </>
    ),
    href: "/dashboard#high-risk",
    icon: BarChart3,
  },
  { id: "alerts", label: "Alerts", href: "/dashboard#alerts", icon: AlertTriangle },
  { id: "analyze", label: "Analyze", href: "/dashboard?view=analyze", icon: Activity },
  { id: "reports", label: "Impact", href: "/impact", icon: FileText },
  { id: "resources", label: "Resources", href: "/pitch", icon: MapIcon },
  { id: "settings", label: "Privacy", href: "/privacy", icon: Settings },
];

const INDIA_NAV: NavItem[] = [
  { id: "overview", label: "Overview", href: "/india", icon: LayoutDashboard },
  { id: "map", label: "India map", href: "/india#chis-map", icon: MapIcon },
  { id: "analyze", label: "Region analyze", href: "/india?view=analyze", icon: Activity },
  { id: "states", label: "Top states", href: "/india#top-states", icon: BarChart3 },
  { id: "dims", label: "Dimensions", href: "/india#dimensions", icon: AlertTriangle },
  { id: "global", label: "Global", href: "/dashboard", icon: Globe2 },
  { id: "resources", label: "Resources", href: "/pitch", icon: FileText },
  { id: "settings", label: "Privacy", href: "/privacy", icon: Settings },
];

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const label = now
    ? now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "Connecting…";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ocean/80">
        Live updates
      </p>
      <p className="mt-1 text-xs font-semibold text-ink/80">{label}</p>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Online
      </p>
    </div>
  );
}

function isActive(
  item: NavItem,
  pathname: string,
  search: string,
  hash: string
) {
  if (item.href.includes("view=analyze")) {
    return search.includes("view=analyze");
  }
  if (item.href.includes("#")) {
    return hash === `#${item.href.split("#")[1]}` && !search.includes("view=analyze");
  }
  if (item.href === "/dashboard" || item.href === "/india") {
    return pathname === item.href && !search.includes("view=analyze") && hash === "";
  }
  return pathname === item.href;
}

export function DashboardShell({
  variant,
  children,
}: {
  variant: "global" | "india";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const scrollToHash = () => {
      const next = window.location.hash;
      setHash(next);
      if (!next) return;
      const el = document.querySelector(next);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname, search]);

  const nav = variant === "india" ? INDIA_NAV : GLOBAL_NAV;

  return (
    <div className="flex min-h-screen bg-[#eef2f7] text-ink">
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/" className="inline-flex">
          <Logo size={44} showText />
        </Link>
        <button
          type="button"
          className="rounded-lg p-2 text-ink hover:bg-slate-100"
          aria-expanded={open}
          aria-controls="dashboard-sidebar"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside
        id="dashboard-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white text-ink shadow-sm transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-5">
          <Link
            href="/"
            className="flex flex-col items-start gap-2"
            onClick={() => setOpen(false)}
          >
            <Logo size={64} showText />
            <PoweredBySustainow logoHeight={12} className="pl-1" />
          </Link>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ocean/70">
            {variant === "india" ? "India console" : "Global console"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item, pathname, search, hash);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-sky-100 text-ocean"
                    : "text-ink/65 hover:bg-slate-50 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-slate-200 p-4">
          <LiveClock />
          <Link
            href={variant === "india" ? "/dashboard" : "/india"}
            onClick={() => setOpen(false)}
            className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-bold text-ocean hover:bg-sky-50"
          >
            {variant === "india" ? "Switch to Global" : "Switch to India"}
          </Link>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col pt-16 lg:pt-0">
        <header className="sticky top-0 z-30 hidden border-b border-slate-200/80 bg-[#eef2f7]/95 px-6 py-4 backdrop-blur lg:block">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                {variant === "india" ? "2. India dashboard" : "1. Global dashboard"}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                {variant === "india" ? (
                  <>
                    India <Abbr of="CHIS" /> dashboard
                  </>
                ) : (
                  "Global overview"
                )}
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                {variant === "india" ? (
                  <>
                    Climate-health intelligence for Indian regions —{" "}
                    <Abbr of="CHIS" showExpansion /> tracks child climate-health
                    burden (0–100).
                  </>
                ) : (
                  <>
                    Real-time climate-health intelligence for children. Scores
                    use <Abbr of="CHIS" showExpansion /> where available.
                  </>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink/70 shadow-sm">
              Window · last 7 days
            </div>
          </div>
        </header>
        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</div>
      </div>
    </div>
  );
}
