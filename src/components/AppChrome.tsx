"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PoweredBySustainow } from "@/components/SustainowWordmark";
import { SiteNav } from "@/components/SiteNav";

const CONSOLE_PREFIXES = ["/dashboard", "/india"];

function isConsolePath(pathname: string) {
  return CONSOLE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Marketing chrome for public pages; console routes render their own sidebar shell. */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const consoleMode = isConsolePath(pathname);

  if (consoleMode) {
    return <main className="console-canvas min-h-screen">{children}</main>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-sky-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-3.5">
          <div className="flex shrink-0 flex-col items-start gap-1">
            <Link
              href="/"
              className="inline-flex"
              aria-label="KlimaGuard Kids home"
            >
              <Logo size={72} showText />
            </Link>
            <PoweredBySustainow className="pl-1" logoHeight={13} />
          </div>
          <SiteNav />
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-sky-100 bg-white/60 py-8 text-center text-sm text-ink/60">
        <p>Open Source · MIT License · Climate & child health intelligence</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <PoweredBySustainow logoHeight={14} />
          <span className="text-ink/35">·</span>
          <Link href="/impact" className="text-ocean hover:underline">
            Impact
          </Link>
          <Link href="/pitch" className="text-ocean hover:underline">
            Acronym guide
          </Link>
          <Link href="/privacy" className="text-ocean hover:underline">
            Privacy
          </Link>
          <a
            href="https://github.com/carbonintelli/KlimaGuardKids"
            className="text-ocean hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contribute on GitHub
          </a>
        </p>
        <p className="mt-1">
          Built for children and communities worldwide — India-first regional
          depth
        </p>
      </footer>
    </>
  );
}
