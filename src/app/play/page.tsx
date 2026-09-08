import { Suspense } from "react";
import { KidsPlayHub } from "@/components/KidsPlayHub";

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Suspense
        fallback={
          <p className="text-center text-sm text-ink/60">Loading play hub…</p>
        }
      >
        <KidsPlayHub />
      </Suspense>
    </div>
  );
}
