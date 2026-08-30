"use client";

import { useEffect, useState } from "react";
import { Check, Heart, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseLog {
  favorite: boolean;
  weight: string;
  reps: string;
  notes: string;
  updatedAt?: string;
}

const emptyLog: ExerciseLog = { favorite: false, weight: "", reps: "", notes: "" };

export function ExerciseTracker({ slug, name }: { slug: string; name: string }) {
  const storageKey = `ff-exercise-${slug}`;
  const [log, setLog] = useState<ExerciseLog>(emptyLog);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) setLog({ ...emptyLog, ...JSON.parse(stored) });
        const recent = JSON.parse(window.localStorage.getItem("ff-recent") ?? "[]") as string[];
        window.localStorage.setItem("ff-recent", JSON.stringify([slug, ...recent.filter((item) => item !== slug)].slice(0, 6)));
      } catch {
        // Storage may be unavailable in strict privacy modes; the guide remains usable.
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [slug, storageKey]);

  function persist(next: ExerciseLog) {
    setLog(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }));
    } catch {
      // Keep the current-session state when persistence is unavailable.
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" aria-labelledby="personal-log-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Stored on this device</p>
          <h2 id="personal-log-heading" className="mt-2 text-xl font-semibold">Your {name} log</h2>
        </div>
        <Button
          type="button"
          variant={log.favorite ? "secondary" : "outline"}
          size="icon"
          className="size-11 rounded-xl"
          onClick={() => persist({ ...log, favorite: !log.favorite })}
          aria-label={log.favorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
        >
          <Heart className={`size-4 ${log.favorite ? "fill-current text-primary" : ""}`} />
        </Button>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium">
          Last weight
          <Input
            value={log.weight}
            onChange={(event) => setLog({ ...log, weight: event.target.value })}
            placeholder="e.g. 50 kg"
            className="mt-2 h-11 rounded-xl"
          />
        </label>
        <label className="text-sm font-medium">
          Last reps
          <Input
            value={log.reps}
            onChange={(event) => setLog({ ...log, reps: event.target.value })}
            placeholder="e.g. 10, 9, 8"
            className="mt-2 h-11 rounded-xl"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium">
        Personal notes
        <Textarea
          value={log.notes}
          onChange={(event) => setLog({ ...log, notes: event.target.value })}
          placeholder="Seat position, handle choice, a cue that worked…"
          className="mt-2 min-h-24 rounded-xl"
        />
      </label>
      <Button type="button" className="mt-4 h-11 w-full rounded-xl sm:w-auto" onClick={() => persist(log)}>
        {saved ? <Check className="size-4" /> : <Save className="size-4" />}
        {saved ? "Saved" : "Save on this device"}
      </Button>
    </section>
  );
}
