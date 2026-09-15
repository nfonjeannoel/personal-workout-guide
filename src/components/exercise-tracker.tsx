"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, ChevronUp, Heart, History, Save, Target } from "lucide-react";

import { useTrainingData } from "@/components/training-data-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nextProgressionTarget, localDateKey, sessionDay, workoutDate, type JournalExerciseLog, type LoggedSet, type WorkoutRecord } from "@/lib/training-data";

function defaultSets(count: number): LoggedSet[] {
  return Array.from({ length: count }, () => ({ reps: null, rir: null, completed: false }));
}

export function ExerciseTracker({ slug, name, recommendedSets, repRange }: { slug: string; name: string; recommendedSets: string; repRange: string }) {
  const { data, hydrated, updateExercise, saveWorkout, markRecent } = useTrainingData();
  const record = data.exercises[slug];
  const setCount = Math.max(1, Number(recommendedSets.match(/\d+/)?.[0] ?? 3));
  const query = useSyncExternalStore(subscribeLocation, () => window.location.search, () => "");
  const params = new URLSearchParams(query);
  const requestedSession = params.get("session");
  const today = localDateKey();
  const session = requestedSession ? data.workouts.find((item) => item.id === requestedSession) : data.workouts.find((item) => workoutDate(item) === today && (sessionDay(item)?.exercises.some((exercise) => exercise.exerciseSlug === slug) || Object.values(item.exerciseLogs ?? {}).some((log) => log.exerciseSlug === slug)));
  const slot = session ? params.get("slot") ?? Object.entries(session.exerciseLogs ?? {}).find(([, log]) => log.exerciseSlug === slug)?.[0] ?? slug : slug;
  const log = session?.exerciseLogs?.[slot];
  const weight = log?.weight ?? record?.history[0]?.weight ?? "";
  const prescription = session ? sessionDay(session)?.exercises.find((item) => item.exerciseSlug === slot)?.sets : undefined;
  const sets = log?.sets ?? defaultSets(Math.min(20, Number(prescription?.match(/(\d+)\s*$/)?.[1] ?? setCount)));
  const notes = record?.notes ?? "";
  const setNotes = (value: string) => updateExercise(slug, { notes: value });
  const setWeight = (value: string) => persist({ weight: value });
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => markRecent(slug), [markRecent, slug]);
  const target = useMemo(() => nextProgressionTarget(record, repRange), [record, repRange]);

  function persist(update: Partial<JournalExerciseLog>) {
    if (!hydrated || (requestedSession && !session)) return;
    const now = new Date().toISOString();
    const nextLog = { ...log, exerciseSlug: slug, weight, sets, ...update, updatedAt: now };
    const base: WorkoutRecord = session ?? { id: `exercise-${crypto.randomUUID()}`, date: today, weekKey: today, daySlug: "custom", plan: { day: 0, slug: "custom", label: "Custom", title: name, emphasis: "Exercise session", type: "training", estimatedMinutes: "At your pace", exercises: [{ exerciseSlug: slug, name, sets: recommendedSets, reps: repRange, rest: "As needed" }] }, completedExercises: [], updatedAt: now };
    const complete = nextLog.sets.length > 0 && nextLog.sets.every((set) => set.completed);
    const completedExercises = complete ? [...new Set([...base.completedExercises, slot])] : base.completedExercises.filter((item) => item !== slot);
    const total = sessionDay(base)?.exercises.length ?? 1;
    saveWorkout({ ...base, exerciseLogs: { ...base.exerciseLogs, [slot]: nextLog }, completedExercises, completedAt: completedExercises.length >= total && total > 0 ? base.completedAt ?? now : undefined, updatedAt: now });
    setSaved(false);
  }

  function updateSet(index: number, update: Partial<LoggedSet>) {
    persist({ sets: sets.map((item, itemIndex) => itemIndex === index ? { ...item, ...update } : item) });
  }

  function saveSession() {
    persist({});
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
  if (requestedSession && !session) return <p>This session was deleted or is unavailable. Open the journal to start another session.</p>;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" aria-labelledby="personal-log-heading">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Personal training log</p><h2 id="personal-log-heading" className="mt-2 text-xl font-semibold">Log {name}</h2></div>
        <Button type="button" variant={record?.favorite ? "secondary" : "outline"} size="icon" className="size-11 rounded-xl" onClick={() => updateExercise(slug, { favorite: !record?.favorite })} aria-label={record?.favorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}><Heart className={`size-4 ${record?.favorite ? "fill-current text-primary" : ""}`} /></Button>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/65 p-4"><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary"><Target className="size-3.5" /> Next target</p><p className="mt-2 text-sm leading-6">{target}</p></div>

      <label className="mt-5 block text-sm font-medium">Weight or resistance<Input value={weight} onChange={(event) => setWeight(event.target.value)} maxLength={100} placeholder="e.g. 50 kg or pin 8" className="mt-2 h-11 rounded-xl" /></label>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Working sets <span className="font-normal text-muted-foreground">· target {repRange}</span></legend>
        <div className="mt-2 space-y-2">
          {sets.map((set, index) => (
            <div key={index} className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 rounded-xl border border-border p-2">
              <Checkbox checked={set.completed} onCheckedChange={(checked) => updateSet(index, { completed: checked === true })} aria-label={`Mark set ${index + 1} complete`} className="size-6 rounded-lg" />
              <label className="text-xs text-muted-foreground">Set {index + 1} reps<Input inputMode="numeric" type="number" min="0" max="100" value={set.reps ?? ""} onChange={(event) => updateSet(index, { reps: event.target.value ? Math.max(0, Math.min(100, Math.round(Number(event.target.value)))) : null, completed: Boolean(event.target.value) })} className="mt-1 h-10 rounded-lg" aria-label={`Set ${index + 1} repetitions`} /></label>
              <label className="text-xs text-muted-foreground">RIR<Input inputMode="numeric" type="number" min="0" max="10" value={set.rir ?? ""} onChange={(event) => updateSet(index, { rir: event.target.value ? Math.max(0, Math.min(10, Math.round(Number(event.target.value)))) : null })} className="mt-1 h-10 rounded-lg" aria-label={`Set ${index + 1} reps in reserve`} /></label>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2"><Button variant="outline" disabled={sets.length >= 20} onClick={() => persist({ sets: [...sets, { reps: null, rir: null, completed: false }] })}>Add set</Button><Button variant="ghost" disabled={sets.length <= 1} onClick={() => persist({ sets: sets.slice(0, -1) })}>Remove last set</Button></div>
        <p className="mt-2 text-xs text-muted-foreground">Working sets save automatically to your journal.</p>
      </fieldset>

      <label className="mt-4 block text-sm font-medium">Personal setup notes<Textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} placeholder="Seat position, handle choice, a cue that worked…" className="mt-2 min-h-20 rounded-xl" /></label>
      <Button type="button" className="mt-4 h-11 w-full rounded-xl" onClick={saveSession} disabled={!sets.some((set) => set.completed)}>{saved ? <Check className="size-4" /> : <Save className="size-4" />}{saved ? "Session saved" : "Save working sets"}</Button>

      {record?.history.length ? (
        <div className="mt-4 border-t border-border pt-4">
          <button type="button" className="flex min-h-10 w-full items-center justify-between rounded-lg text-sm font-medium" onClick={() => setShowHistory((value) => !value)} aria-expanded={showHistory}><span className="flex items-center gap-2"><History className="size-4 text-primary" /> History ({record.history.length})</span>{showHistory ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</button>
          {showHistory && <ol className="mt-2 space-y-2">{record.history.slice(0, 8).map((session) => <li key={session.id} className="rounded-xl bg-secondary/55 p-3 text-sm"><div className="flex items-center justify-between gap-3"><time className="text-muted-foreground" dateTime={session.performedAt}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(session.performedAt))}</time><strong>{session.weight || "Bodyweight"}</strong></div><p className="mt-1 font-mono text-xs text-muted-foreground">{session.sets.filter((set) => set.completed).map((set) => `${set.reps ?? "–"}${set.rir !== null ? ` @ ${set.rir} RIR` : ""}`).join(" · ")}</p></li>)}</ol>}
        </div>
      ) : null}
    </section>
  );
}

function subscribeLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
