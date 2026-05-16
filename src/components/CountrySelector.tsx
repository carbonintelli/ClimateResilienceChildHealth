"use client";

import type { CountryOption } from "@/lib/types";

interface Props {
  countries: CountryOption[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CountrySelector({
  countries,
  value,
  onChange,
  disabled,
}: Props) {
  return (
    <label className="block w-full">
      <span className="mb-2 block text-sm font-bold text-ink/70">
        Select your country
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border-2 border-sky-200 bg-white px-4 py-3 text-base font-semibold text-ink shadow-sm focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/30 disabled:opacity-60"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
