"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, Pause, Play, RotateCcw, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";

const TIMER_KEY = "ff-rest-timer";

function formatTime(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function readTimer(defaultSeconds: number) {
  try {
    const stored = JSON.parse(window.localStorage.getItem(TIMER_KEY) ?? "null") as { endAt?: number; remaining?: number } | null;
    if (stored?.endAt && stored.endAt > Date.now()) return { seconds: Math.ceil((stored.endAt - Date.now()) / 1000), running: true, endAt: stored.endAt };
    if (typeof stored?.remaining === "number" && stored.remaining > 0) return { seconds: stored.remaining, running: false, endAt: null };
  } catch { /* Use the supplied default when storage is unavailable. */ }
  return { seconds: defaultSeconds, running: false, endAt: null };
}

export function RestTimer({ defaultSeconds = 120, compact = false }: { defaultSeconds?: number; compact?: boolean }) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const endAtRef = useRef<number | null>(null);
  const notifiedRef = useRef(false);

  const alertFinished = useCallback(() => {
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    if ("vibrate" in navigator) navigator.vibrate([180, 100, 180]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Rest complete", { body: "Your next working set is ready.", icon: "/icons/icon-192.png", tag: "form-function-rest" });
    }
    try {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 740;
        gain.gain.setValueAtTime(0.12, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.45);
      }
    } catch { /* Vibration and visible state still indicate completion. */ }
  }, []);

  const updateFromClock = useCallback(() => {
    if (!endAtRef.current) return;
    const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
    setSeconds(remaining);
    if (remaining === 0) {
      endAtRef.current = null;
      setRunning(false);
      try { window.localStorage.removeItem(TIMER_KEY); } catch { /* no-op */ }
      alertFinished();
    }
  }, [alertFinished]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const restored = readTimer(defaultSeconds);
      setSeconds(restored.seconds);
      setRunning(restored.running);
      endAtRef.current = restored.endAt;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    updateFromClock();
    const interval = window.setInterval(updateFromClock, 250);
    document.addEventListener("visibilitychange", updateFromClock);
    window.addEventListener("focus", updateFromClock);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", updateFromClock);
      window.removeEventListener("focus", updateFromClock);
    };
  }, [running, updateFromClock]);

  function toggle() {
    if (running) {
      const remaining = endAtRef.current ? Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)) : seconds;
      endAtRef.current = null;
      setSeconds(remaining);
      setRunning(false);
      try { window.localStorage.setItem(TIMER_KEY, JSON.stringify({ remaining })); } catch { /* session-only fallback */ }
      return;
    }
    if (seconds <= 0) return;
    notifiedRef.current = false;
    const endAt = Date.now() + seconds * 1000;
    endAtRef.current = endAt;
    setRunning(true);
    try { window.localStorage.setItem(TIMER_KEY, JSON.stringify({ endAt })); } catch { /* session-only fallback */ }
    if ("Notification" in window && Notification.permission === "default") void Notification.requestPermission();
  }

  function reset(value = defaultSeconds) {
    endAtRef.current = null;
    notifiedRef.current = false;
    setRunning(false);
    setSeconds(value);
    try { window.localStorage.setItem(TIMER_KEY, JSON.stringify({ remaining: value })); } catch { /* session-only fallback */ }
  }

  return (
    <div className={`rounded-2xl border border-border bg-card ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">{seconds === 0 ? <BellRing className="size-4 text-primary" /> : <Timer className="size-4" />}</span><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{seconds === 0 ? "Rest complete" : "Rest timer"}</p><p className="font-mono text-2xl font-semibold tabular-nums" aria-live="polite">{formatTime(seconds)}</p></div></div>
        <div className="flex gap-1.5"><Button type="button" size="icon" variant="outline" className="size-10 rounded-xl" onClick={toggle} disabled={seconds === 0} aria-label={running ? "Pause rest timer" : "Start rest timer"}>{running ? <Pause className="size-4" /> : <Play className="size-4" />}</Button><Button type="button" size="icon" variant="ghost" className="size-10 rounded-xl" onClick={() => reset()} aria-label="Reset rest timer"><RotateCcw className="size-4" /></Button></div>
      </div>
      {!compact && <div className="mt-4 grid grid-cols-4 gap-2">{[60, 90, 120, 180].map((value) => <Button key={value} type="button" variant={!running && seconds === value ? "secondary" : "ghost"} size="sm" className="rounded-lg" onClick={() => reset(value)}>{value < 120 ? `${value}s` : `${value / 60}m`}</Button>)}</div>}
    </div>
  );
}
