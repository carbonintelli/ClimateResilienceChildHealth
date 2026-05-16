import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KlimaGuard Kids — Child-Centric Climate Health Intelligence",
  description:
    "Open-source, agentic AI platform helping children worldwide prepare for climate disruptions affecting health, nutrition, and disease risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <header className="sticky top-0 z-50 border-b border-sky-200/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🌍
              </span>
              <span className="text-lg font-extrabold text-ocean">
                KlimaGuard Kids
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-semibold">
              <Link
                href="/dashboard"
                className="text-ink/80 hover:text-ocean transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/pitch"
                className="rounded-full bg-ocean px-4 py-2 text-white shadow-md hover:bg-sky-600 transition-colors"
              >
                Pitch
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-16 border-t border-sky-100 bg-white/60 py-8 text-center text-sm text-ink/60">
          <p>
            Open Source · UNICEF Climate & Health aligned · Data from trusted
            public APIs
          </p>
          <p className="mt-1">
            Built for children and communities in every country
          </p>
        </footer>
      </body>
    </html>
  );
}
