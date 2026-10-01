"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = formatter.formatToParts(now ?? new Date());
  const hour = parts.find((p) => p.type === "hour")?.value ?? "--";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "--";
  const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value ?? "";

  return (
    <div
      className="chip flex items-center gap-1 rounded-full px-3 py-1.5 font-mono text-[13px] text-paper-100"
      suppressHydrationWarning
    >
      <span className="tabular-nums">{hour}</span>
      <span aria-hidden className="animate-colon-blink">
        :
      </span>
      <span className="tabular-nums">{minute}</span>
      <span className="ml-1 text-[10px] uppercase tracking-wide text-paper-100/60">{dayPeriod}</span>
      <span className="sr-only">{`${hour}:${minute} ${dayPeriod}, India time`}</span>
    </div>
  );
}
