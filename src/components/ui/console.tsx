import Link from "next/link";

/** Shared surface for console cards and toolbars. */
export function Panel({
  children,
  className = "",
  id,
  as: Tag = "section",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag
      id={id}
      className={`scroll-mt-24 rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70 sm:p-5 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg font-extrabold tracking-tight text-ink ${className}`}>
      {children}
    </h2>
  );
}

export function PanelSubtitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-ink/55 ${className}`}>{children}</p>;
}

type ButtonVariant = "primary" | "india" | "secondary" | "ghost";

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-ocean text-white shadow-sm hover:bg-sky-600 focus-visible:ring-ocean/40",
  india:
    "bg-gradient-to-r from-saffron to-ocean text-white shadow-sm hover:opacity-95 focus-visible:ring-saffron/40",
  secondary:
    "border border-slate-200 bg-white text-ink hover:bg-slate-50 focus-visible:ring-slate-300/60",
  ghost: "text-ocean hover:bg-sky-50 focus-visible:ring-ocean/30",
};

export function ConsoleButton({
  children,
  className = "",
  variant = "primary",
  href,
  type = "button",
  disabled,
  onClick,
  fullWidth,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-[transform,opacity,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98] ${BUTTON_STYLES[variant]} ${fullWidth ? "w-full py-3.5 text-base" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function StatusBadge({
  tone = "neutral",
  children,
}: {
  tone?: "live" | "seed" | "neutral" | "warn";
  children: React.ReactNode;
}) {
  const styles = {
    live: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
    seed: "bg-amber-50 text-amber-900 ring-amber-200/80",
    warn: "bg-rose-50 text-rose-800 ring-rose-200/80",
    neutral: "bg-slate-50 text-ink/70 ring-slate-200/80",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${styles}`}
    >
      {tone === "live" ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      ) : null}
      {children}
    </span>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
      aria-hidden
    />
  );
}
