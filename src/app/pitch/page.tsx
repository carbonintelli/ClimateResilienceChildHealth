import Link from "next/link";
import {
  Target,
  Users,
  Cpu,
  HeartHandshake,
  TrendingUp,
  Lock,
} from "lucide-react";

export default function PitchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm font-bold text-ocean uppercase tracking-widest">
        UNICEF Venture Fund · Climate × Children&apos;s Health
      </p>
      <h1 className="mt-2 text-4xl font-extrabold text-ink leading-tight">
        KlimaGuard Kids
      </h1>
      <p className="mt-2 text-xl text-ink/70 font-semibold">
        Agentic early-warning intelligence that helps every child prepare for
        climate disruptions to health, food, and wellbeing.
      </p>

      <div className="mt-8 rounded-3xl bg-ocean/10 border border-ocean/20 p-6">
        <p className="text-sm font-bold text-ocean">Ask</p>
        <p className="mt-2 text-lg font-semibold text-ink">
          Up to US$100,000 equity-free seed · Open Source · Global · Apply by
          May 17, 2026
        </p>
      </div>

      <Section icon={Target} title="Problem">
        <p>
          Climate change is not a future threat for children — it is reshaping
          health today. Heatwaves, floods, air pollution, vector-borne disease,
          and food insecurity compound fastest in low- and middle-income
          countries. Yet most climate tools speak to policymakers, not to the
          2.4 billion children who need anticipatory, age-appropriate guidance
          their families and schools can act on within days, not seasons.
        </p>
      </Section>

      <Section icon={Cpu} title="Solution — Agentic AI platform">
        <p>
          KlimaGuard Kids deploys five cooperating AI agents that ingest
          authenticated public feeds (Open-Meteo weather & air quality, aligned
          with WHO and UNICEF safeguarding principles), correlate signals across
          health, nutrition, and disease domains, and output inference-ready
          briefings plus child-facing preparedness cards for ages 5–17.
        </p>
        <ul className="mt-4 list-disc pl-6 space-y-2 text-ink/80">
          <li>
            <strong>Climate Data Agent</strong> — live 7-day forecast, heat
            index, AQI
          </li>
          <li>
            <strong>Health Risk Agent</strong> — heat stress, respiratory, flood,
            vector alerts
          </li>
          <li>
            <strong>Nutrition Agent</strong> — hydration targets, food safety,
            scarcity patterns
          </li>
          <li>
            <strong>Disease Agent</strong> — waterborne, vector, heat illness
            prevention
          </li>
          <li>
            <strong>Synthesis Agent</strong> — cross-correlation + age-banded
            guidance
          </li>
        </ul>
      </Section>

      <Section icon={Users} title="Who we serve">
        <p>
          Children, caregivers, teachers, community health workers, and local
          authorities in all UNICEF programme countries — starting with 20
          demo cities and extensible to any coordinates via API. Languages and
          offline modes are on the roadmap; architecture is Open Source (MIT)
          for local adaptation.
        </p>
      </Section>

      <Section icon={HeartHandshake} title="Impact & SDG alignment">
        <ul className="list-disc pl-6 space-y-2 text-ink/80">
          <li>SDG 3 — Good health: anticipatory action for climate-sensitive risks</li>
          <li>SDG 13 — Climate action: child-centred early warning</li>
          <li>SDG 2 — Zero hunger: nutrition & food security inference</li>
          <li>SDG 4 — Quality education: school-ready heat/flood guidance</li>
        </ul>
      </Section>

      <Section icon={TrendingUp} title="Traction & prototype">
        <p>
          Functional web prototype with live Open-Meteo integration, multi-agent
          orchestration API, global country selector, and investor pitch. Ready
          for field pilots with ministries of health and education partners.
        </p>
      </Section>

      <Section icon={Lock} title="Safeguarding & data ethics">
        <p>
          No child accounts required for demo. Location is country/city level
          only. Agents cite provenance. Future work: COPPA/GDPR-K compliance,
          local language models hosted in-region, and partnership with national
          meteorological services for authenticated enterprise feeds.
        </p>
      </Section>

      <section className="mt-12 rounded-3xl bg-ink text-white p-8">
        <h2 className="text-2xl font-extrabold">Use of funds (US$100K)</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-bold">40% — Engineering</p>
            <p className="mt-1 text-white/80">
              Offline PWA, 12 languages, SMS/USSD channel
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-bold">30% — Field validation</p>
            <p className="mt-1 text-white/80">
              Pilots in South Asia & East Africa with schools and CHWs
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-bold">20% — Data partnerships</p>
            <p className="mt-1 text-white/80">
              National met services, WHO outbreak feeds, nutrition APIs
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="font-bold">10% — Open Source community</p>
            <p className="mt-1 text-white/80">
              Documentation, contributor grants, security audits
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link
          href="/dashboard"
          className="inline-block rounded-full bg-ocean px-8 py-4 font-extrabold text-white shadow-lg hover:bg-sky-600"
        >
          Try the live demo
        </Link>
        <p className="mt-4 text-sm text-ink/50">
          Reference:{" "}
          <a
            href="https://www.startupgrantsindia.com/funding-frontier-climate-tech-for-childrens-health"
            className="text-ocean hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            UNICEF Venture Fund — Climate tech for children&apos;s health
          </a>
        </p>
      </section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
        <Icon className="h-6 w-6 text-ocean" />
        {title}
      </h2>
      <div className="mt-4 text-ink/80 leading-relaxed">{children}</div>
    </section>
  );
}
