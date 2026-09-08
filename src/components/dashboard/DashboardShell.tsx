"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
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
import { StatusBadge } from "@/components/ui/console";

type NavItem = {
  id: string;
  label: React.ReactNode;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const GLOBAL_GROUPS: NavGroup[] = [
  {
    id: "monitor",
    label: "Monitor",
    items: [
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
    ],
  },
  {
    id: "action",
    label: "Action",
    items: [
      { id: "analyze", label: "Analyze", href: "/dashboard?view=analyze", icon: Activity },
    ],
  },
  {
    id: "more",
    label: "Resources",
    items: [
      { id: "reports", label: "Impact", href: "/impact", icon: FileText },
      { id: "resources", label: "Acronym guide", href: "/pitch", icon: MapIcon },
      { id: "settings", label: "Privacy", href: "/privacy", icon: Settings },
    ],
  },
];

const INDIA_GROUPS: NavGroup[] = [
  {
    id: "monitor",
    label: "Monitor",
    items: [
      { id: "overview", label: "Overview", href: "/india", icon: LayoutDashboard },
      { id: "map", label: "India map", href: "/india#chis-map", icon: MapIcon },
      { id: "states", label: "Top states", href: "/india#top-states", icon: BarChart3 },
      { id: "dims", label: "Dimensions", href: "/india#dimensions", icon: AlertTriangle },
    ],
  },
  {
    id: "action",
    label: "Action",
    items: [
      { id: "analyze", label: "Region analyze", href: "/india?view=analyze", icon: Activity },
      { id: "global", label: "Global console", href: "/dashboard", icon: Globe2 },
    ],
  },
  {
    id: "more",
    label: "Resources",
    items: [
      { id: "resources", label: "Acronym guide", href: "/pitch", icon: FileText },
      { id: "settings", label: "Privacy", href: "/privacy", icon: Settings },
    ],
  },
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
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45">
          Last refresh
        </p>
        <StatusBadge tone="live">Online</StatusBadge>
      </div>
      <p className="mt-1.5 text-xs font-semibold text-ink/75">{label}</p>
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
  const analyze = searchParams.get("view") === "analyze";
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

  const groups = variant === "india" ? INDIA_GROUPS : GLOBAL_GROUPS;
  const title =
    variant === "india"
      ? analyze
        ? "India region analyze"
        : "India dashboard"
      : analyze
        ? "Place analyze"
        : "Global overview";
  const eyebrow = variant === "india" ? "India console" : "Global console";
  const subtitle =
    variant === "india" ? (
      analyze ? (
        <>Pick a climate zone and run the India agent pipeline.</>
      ) : (
        <>
          Climate-health intelligence for Indian regions —{" "}
          <Abbr of="CHIS" showExpansion /> tracks child climate-health burden
          (0–100).
        </>
      )
    ) : analyze ? (
      <>Select a curated city or any place worldwide, then run agents.</>
    ) : (
      <>
        Real-time climate-health intelligence for children. Scores use{" "}
        <Abbr of="CHIS" showExpansion /> where available.
      </>
    );

  return (
    <div className="console-canvas flex min-h-screen text-ink">
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <Link href="/" className="inline-flex">
            <Logo size={40} showText />
          </Link>
          <p className="mt-0.5 truncate text-xs font-semibold text-ink/55">{title}</p>
        </div>
        <button
          type="button"
          className="rounded-xl p-2 text-ink transition-colors hover:bg-slate-100"
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-slate-200/80 bg-white/95 text-ink shadow-[4px_0_24px_rgba(15,23,42,0.04)] backdrop-blur transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200/80 px-4 py-5">
          <Link
            href="/"
            className="flex flex-col items-start gap-2"
            onClick={() => setOpen(false)}
          >
            <Logo size={58} showText />
            <PoweredBySustainow logoHeight={12} className="pl-1" />
          </Link>
          <div className="mt-4 flex items-center gap-2">
            <StatusBadge tone="neutral">{eyebrow}</StatusBadge>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Dashboard">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item, pathname, search, hash);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        active
                          ? "bg-sky-50 text-ocean shadow-sm ring-1 ring-sky-100"
                          : "text-ink/60 hover:bg-slate-50 hover:text-ink"
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? "bg-ocean/10 text-ocean"
                            : "bg-slate-100 text-ink/50 group-hover:bg-white group-hover:text-ink/70"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </span>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-3 border-t border-slate-200/80 p-4">
          <LiveClock />
          <Link
            href={variant === "india" ? "/dashboard" : "/india"}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-ink/75 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-ocean"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden />
            {variant === "india" ? "Switch to Global" : "Switch to India"}
          </Link>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[1px] lg:hidden"
          aria-label="Close sidebar overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col pt-[4.25rem] lg:pt-0">
        <header className="sticky top-0 z-30 hidden border-b border-slate-200/70 bg-white/70 px-6 py-4 backdrop-blur-md lg:block">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="console-fade-up min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ocean/80">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-[1.75rem]">
                {variant === "india" && !analyze ? (
                  <>
                    India <Abbr of="CHIS" /> dashboard
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink/55">
                {subtitle}
              </p>
            </div>
            <div className="console-fade-up console-fade-up-delay-1 flex flex-wrap items-center gap-2">
              <StatusBadge tone="neutral">Window · last 7 days</StatusBadge>
              <StatusBadge tone={analyze ? "warn" : "live"}>
                {analyze ? "Analyze mode" : "Overview mode"}
              </StatusBadge>
            </div>
          </div>
        </header>
        <div className="console-fade-up console-fade-up-delay-2 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </div>
      </div>
    </div>
  );
}
