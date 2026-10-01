"use client";

import { useEffect, useState } from "react";

/**
 * There's no real listener analytics wired up, so this is an ambient
 * random-walk number rather than a live count — it exists to make the
 * station feel alive, not as a factual claim. Swap in a real count from
 * your analytics/backend if you have one.
 */
export default function ListenerCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(40 + Math.floor(Math.random() * 60));
    const id = window.setInterval(() => {
      setCount((current) => {
        if (current === null) return current;
        const delta = Math.round((Math.random() - 0.5) * 6);
        return Math.max(12, Math.min(220, current + delta));
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="chip flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[12px] text-paper-100/85">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass-300 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brass-500" />
      </span>
      <span className="tabular-nums" suppressHydrationWarning>
        {count ?? "—"}
      </span>
      <span className="hidden text-paper-100/55 sm:inline">listening now</span>
    </div>
  );
}
