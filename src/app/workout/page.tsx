import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, Dumbbell, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getExercise } from "@/data/exercises";
import { trainingPrinciples, workoutDays } from "@/data/workouts";

export const metadata: Metadata = {
  title: "Weekly Workout Program",
  description: "A five-day upper/lower training plan with recovery days, exercise targets, rest periods, and alternatives.",
};

export default function WorkoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Weekly program</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">A repeatable week, built to progress.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Four focused lifting days, one active recovery day, and room to recover. Major muscle groups are trained approximately twice per week.</p>
      </div>

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {workoutDays.map((day) => (
          <article key={day.slug} className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2"><Badge>{day.label}</Badge><Badge variant="outline">{day.estimatedMinutes}</Badge></div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">{day.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{day.emphasis}</p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-secondary-foreground">{day.type === "training" ? <Dumbbell className="size-5" /> : <Sparkles className="size-5" />}</span>
            </div>

            {day.exercises.length ? (
              <ol className="mt-6 space-y-3">
                {day.exercises.map((item) => {
                  const exercise = getExercise(item.exerciseSlug);
                  if (!exercise) return null;
                  return (
                    <li key={item.exerciseSlug} className="flex items-center gap-3 border-t border-border/70 pt-3 first:border-0 first:pt-0">
                      <span className="min-w-0 flex-1"><Link className="font-medium hover:text-primary" href={`/exercises/${exercise.slug}`}>{exercise.name}</Link><span className="mt-0.5 block text-xs text-muted-foreground">{exercise.muscleGroup}</span></span>
                      <span className="text-right font-mono text-sm"><strong className="block">{item.sets} × {item.reps}</strong><span className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground"><Clock3 className="size-3" /> {item.rest}</span></span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <ul className="mt-6 space-y-2 text-sm leading-6 text-muted-foreground">{day.recovery?.map((item) => <li key={item}>• {item}</li>)}</ul>
            )}
            <Link href={`/workout/${day.slug}`} className="mt-6 flex min-h-11 items-center justify-between rounded-xl bg-secondary px-4 text-sm font-semibold transition-colors hover:bg-accent">
              Open {day.title} <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-secondary/45 p-6 sm:p-8" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-2xl font-semibold">Program rules</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {trainingPrinciples.map((principle, index) => (
            <div key={principle} className="flex gap-3 rounded-2xl bg-background/60 p-4 text-sm leading-6"><span className="font-mono text-primary">0{index + 1}</span><p>{principle}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}
