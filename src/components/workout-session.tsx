"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Check, Clock3, Repeat2, RotateCcw, Shuffle, Sparkles, Target } from "lucide-react";

import { RestTimer } from "@/components/rest-timer";
import { useTrainingData } from "@/components/training-data-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { WorkoutDay } from "@/data/workouts";
import { nextProgressionTarget } from "@/lib/training-data";

export interface WorkoutExerciseSummary {
  slug: string;
  name: string;
  muscleGroup: string;
  image: string;
  repRange: string;
  alternatives: string[];
}

export function WorkoutSession({ day, exerciseMap, compact = false }: { day: WorkoutDay; exerciseMap: Record<string, WorkoutExerciseSummary>; compact?: boolean }) {
  const { data, hydrated, saveWorkout, recordSwap } = useTrainingData();
  const weekKey = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    const offset = now.getDay() === 0 ? -6 : 1 - now.getDay();
    monday.setDate(now.getDate() + offset);
    return monday.toISOString().slice(0, 10);
  }, []);
  const workoutId = `${weekKey}-${day.slug}`;
  const workout = data.workouts.find((item) => item.id === workoutId);
  const completed = hydrated ? workout?.completedExercises ?? [] : [];

  function currentExercise(originalSlug: string) {
    const swap = data.swaps.find((item) => item.id === `${workoutId}-${originalSlug}`);
    return exerciseMap[swap?.replacementSlug ?? originalSlug] ?? exerciseMap[originalSlug];
  }

  function toggle(slug: string) {
    const next = completed.includes(slug) ? completed.filter((item) => item !== slug) : [...completed, slug];
    const now = new Date().toISOString();
    saveWorkout({ id: workoutId, weekKey, daySlug: day.slug, completedExercises: next, completedAt: next.length === day.exercises.length ? now : undefined, updatedAt: now });
  }

  function resetWorkout() {
    saveWorkout({ id: workoutId, weekKey, daySlug: day.slug, completedExercises: [], updatedAt: new Date().toISOString() });
  }

  function swapExercise(originalSlug: string, replacementSlug: string) {
    recordSwap({ id: `${workoutId}-${originalSlug}`, originalSlug, replacementSlug, daySlug: day.slug, swappedAt: new Date().toISOString() });
  }

  if (day.type !== "training") {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{day.label}</p>{compact ? <h2 className="mt-2 text-3xl font-semibold tracking-tight">{day.title}</h2> : <h1 className="mt-2 text-3xl font-semibold tracking-tight">{day.title}</h1>}<p className="mt-2 text-muted-foreground">{day.emphasis}</p></div></div>
        <ul className="mt-7 space-y-3">{day.recovery?.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-secondary/60 p-4 leading-6"><Check className="mt-0.5 size-5 shrink-0 text-primary" /> {item}</li>)}</ul>
      </section>
    );
  }

  const percent = Math.round((completed.length / day.exercises.length) * 100);
  return (
    <section aria-labelledby={`${day.slug}-heading`}>
      {!compact && <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{day.label}</p><h1 id={`${day.slug}-heading`} className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{day.title}</h1><p className="mt-3 text-muted-foreground">{day.emphasis} · {day.estimatedMinutes}</p></div>}
      <div className="mb-5 rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between gap-3 text-sm"><span className="font-medium">Workout progress</span><span className="font-mono text-muted-foreground">{completed.length}/{day.exercises.length} complete</span></div><Progress value={percent} aria-label={`${percent}% of workout complete`} /></div>

      <div className="space-y-3">
        {day.exercises.map((item, index) => {
          const original = exerciseMap[item.exerciseSlug];
          const exercise = currentExercise(item.exerciseSlug);
          if (!exercise || !original) return null;
          const checked = completed.includes(item.exerciseSlug);
          const target = nextProgressionTarget(data.exercises[exercise.slug], item.reps);
          const options = [original.slug, ...original.alternatives].map((slug) => exerciseMap[slug]).filter(Boolean);
          return (
            <article key={`${item.exerciseSlug}-${index}`} className={`rounded-2xl border p-4 transition-colors sm:p-5 ${checked ? "border-primary/30 bg-primary/[0.045]" : "border-border bg-card"}`}>
              <div className="flex items-start gap-3 sm:gap-4">
                <Checkbox checked={checked} onCheckedChange={() => toggle(item.exerciseSlug)} aria-label={`Mark ${exercise.name} complete`} className="mt-1 size-6 rounded-lg" />
                <div className="min-w-0 flex-1">
                  {exercise.slug !== original.slug && <p className="mb-1 text-xs text-primary">Swapped from {original.name}</p>}
                  <Link href={`/exercises/${exercise.slug}`} className="group block rounded-sm focus-visible:outline-none">
                    <span className={`block text-base font-semibold sm:text-lg ${checked ? "text-muted-foreground line-through" : ""}`}>{exercise.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5 font-mono text-foreground"><Repeat2 className="size-3.5" /> {item.sets} × {item.reps}</span><span className="flex items-center gap-1.5"><Clock3 className="size-3.5" /> {item.rest}</span></span>
                    <span className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-primary"><Target className="mt-0.5 size-3 shrink-0" /> {target}</span>
                    {item.note && <span className="mt-2 block text-xs leading-5 text-muted-foreground">{item.note}</span>}
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" className="h-9 rounded-lg" render={<Link href={`/exercises/${exercise.slug}`} />}>Log sets <ArrowRight className="size-3.5" /></Button>
                    <label className="relative flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Shuffle className="size-3.5" /><span>Swap</span><select className="absolute inset-0 cursor-pointer opacity-0" value={exercise.slug} onChange={(event) => swapExercise(item.exerciseSlug, event.target.value)} aria-label={`Swap ${original.name}`}>
                      {options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}
                    </select></label>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><RestTimer defaultSeconds={120} compact /><Button variant="ghost" className="h-full min-h-16 rounded-2xl" onClick={resetWorkout}><RotateCcw className="size-4" /> Reset workout</Button></div>
    </section>
  );
}
