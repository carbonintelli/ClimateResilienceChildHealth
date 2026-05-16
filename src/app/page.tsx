import Link from "next/link";
import { Shield, Sparkles, Globe2, Bot } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <section className="text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-ocean/10 px-4 py-1 text-sm font-bold text-ocean">
          <Sparkles className="h-4 w-4" />
          Open Source · Agentic AI · Every Country
        </p>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Help every child{" "}
          <span className="text-ocean">see climate coming</span> — and stay
          healthy
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-ink/70">
          KlimaGuard Kids connects trusted climate data with health, nutrition,
          and disease intelligence through five cooperating AI agents — turning
          raw forecasts into age-appropriate guidance children can act on with
          their families and communities.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-ocean px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-sky-600 transition-colors"
          >
            Open global dashboard
          </Link>
          <Link
            href="/pitch"
            className="rounded-full border-2 border-ocean px-8 py-4 text-lg font-bold text-ocean hover:bg-ocean/5 transition-colors"
          >
            View UNICEF-aligned pitch
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Feature
          icon={Bot}
          title="5 AI agents"
          text="Climate, health, nutrition, disease, and synthesis agents fetch, correlate, and explain risks."
        />
        <Feature
          icon={Globe2}
          title="195+ countries ready"
          text="Demo registry covers UNICEF programme countries; extend with any lat/lon via API."
        />
        <Feature
          icon={Shield}
          title="Child safeguarding"
          text="Privacy-first design, age-banded language, and caregiver prompts — no personal data required."
        />
        <Feature
          icon={Sparkles}
          title="Early action"
          text="Anticipatory windows for heat, floods, air quality, vectors, and food security."
        />
      </section>

      <section className="mt-20 rounded-3xl bg-white/80 border border-sky-100 p-8 shadow-lg">
        <h2 className="text-2xl font-extrabold text-ink text-center">
          How agentic AI works here
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-5 text-center text-sm">
          {[
            ["1", "Climate Agent", "Open-Meteo live feed"],
            ["2", "Health Agent", "Heat, air, water risks"],
            ["3", "Nutrition Agent", "Food & hydration"],
            ["4", "Disease Agent", "Vectors & outbreaks"],
            ["5", "Synthesis", "Child guidance"],
          ].map(([step, name, desc]) => (
            <li key={step} className="rounded-2xl bg-sky-50 p-4">
              <span className="text-2xl font-extrabold text-ocean">{step}</span>
              <p className="mt-2 font-bold text-ink">{name}</p>
              <p className="mt-1 text-ink/60">{desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-3xl bg-gradient-to-r from-ocean to-sky-500 p-8 text-white text-center">
        <h2 className="text-xl font-extrabold">
          Aligned with UNICEF Venture Fund — Climate × Children&apos;s Health
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-white/90 text-sm">
          Equity-free funding up to US$100,000 for Open Source frontier tech.
          Applications due May 17, 2026. This prototype demonstrates early
          warning, predictive health readiness, and trusted community data
          interpretation.
        </p>
        <a
          href="https://www.unicef.org/innovation/venturefund"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-bold text-ocean hover:bg-sky-50"
        >
          Learn about the fund
        </a>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm">
      <Icon className="h-8 w-8 text-ocean" />
      <h3 className="mt-4 font-extrabold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{text}</p>
    </div>
  );
}
