"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function RestTimer({ defaultSeconds = 120, compact = false }: { defaultSeconds?: number; compact?: boolean }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          if ("vibrate" in navigator) navigator.vibrate([180, 100, 180]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  function reset(value = defaultSeconds) {
    setRunning(false);
    setSeconds(value);
  }

  return (
    <div className={`rounded-2xl border border-border bg-card ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Timer className="size-4" /></span>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Rest timer</p>
            <p className="font-mono text-2xl font-semibold tabular-nums" aria-live="polite">{formatTime(seconds)}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button type="button" size="icon" variant="outline" className="size-10 rounded-xl" onClick={() => setRunning((value) => !value)} aria-label={running ? "Pause rest timer" : "Start rest timer"}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button type="button" size="icon" variant="ghost" className="size-10 rounded-xl" onClick={() => reset()} aria-label="Reset rest timer">
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[60, 90, 120, 180].map((value) => (
            <Button key={value} type="button" variant={seconds === value ? "secondary" : "ghost"} size="sm" className="rounded-lg" onClick={() => reset(value)}>
              {value < 120 ? `${value}s` : `${value / 60}m`}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
