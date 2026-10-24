"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Counts down to the server's `endsAt`. Display only: the deadline that
 * counts is still checked on the server at submission.
 */
export function Timer({
  endsAt,
  onExpire,
}: {
  endsAt: string;
  onExpire: () => void;
}) {
  // Null until mounted, so the server and browser renders match.
  const [remaining, setRemaining] = useState<number | null>(null);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, Date.parse(endsAt) - Date.now());
      setRemaining(ms);
      if (ms === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const isLow = remaining !== null && remaining < 5 * 60_000;

  return (
    <span
      role="timer"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-sm font-semibold tabular-nums ring-1 ${
        isLow
          ? "animate-pulse bg-red-50 text-red-700 ring-red-200"
          : "bg-slate-50 text-slate-800 ring-slate-200"
      }`}
    >
      <Clock className="h-4 w-4" aria-hidden />
      {remaining === null ? "--:--" : formatRemaining(remaining)}
    </span>
  );
}
