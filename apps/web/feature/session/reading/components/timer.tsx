"use client";

import { useEffect, useRef, useState } from "react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Hitung mundur ke `endsAt` dari server. Hanya tampilan: batas waktu yang
 * berlaku tetap dicek di server saat submit.
 */
export function Timer({
  endsAt,
  onExpire,
}: {
  endsAt: string;
  onExpire: () => void;
}) {
  // Null sampai mount, supaya render server & browser tidak berbeda.
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
      className={`font-mono text-lg font-semibold tabular-nums ${isLow ? "text-red-600" : ""}`}
    >
      {remaining === null ? "--:--" : formatRemaining(remaining)}
    </span>
  );
}
