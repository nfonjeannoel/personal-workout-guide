"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SessionTracker, dateKey, mondayKey } from "@/components/my-training-dashboard";
import { useTrainingData } from "@/components/training-data-provider";
import { Button } from "@/components/ui/button";
import type { WorkoutDay } from "@/data/workouts";
import { sessionDay, workoutDate, type WorkoutRecord } from "@/lib/training-data";

export interface WorkoutExerciseSummary {
  slug: string; name: string; muscleGroup: string; image: string; repRange: string; alternatives: string[];
}

export function WorkoutSession({ day, exerciseMap, compact = false }: { day: WorkoutDay; exerciseMap: Record<string, WorkoutExerciseSummary>; compact?: boolean }) {
  const router = useRouter();
  const { data, hydrated, saveWorkout, addPerformance, recordSwap } = useTrainingData();
  const [sessionKey] = useState(() => crypto.randomUUID());
  const [date, setDate] = useState(() => dateKey(new Date()));
  const existing = data.workouts.find((item) => workoutDate(item) === date && (compact || item.daySlug === day.slug));
  const actualDay = existing ? sessionDay(existing) ?? day : day;
  const session: WorkoutRecord = existing ?? { id: `session-${date}-${day.slug}-${sessionKey}`, date, weekKey: mondayKey(date), daySlug: day.slug, plan: day, completedExercises: [], updatedAt: new Date().toISOString() };
  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
  return <section>
    {!compact && <h1 className="text-4xl font-semibold">{actualDay.title}</h1>}
    <div className="mt-4 flex flex-wrap items-end justify-between gap-3"><label className="text-sm font-medium">Workout date<input type="date" value={date} onChange={(event) => { if (event.target.value) setDate(event.target.value); }} className="mt-2 block rounded-xl border bg-background p-3" /></label><Button variant="outline" render={<Link href="/my-training" />}>Open journal</Button></div>
    <SessionTracker key={`${session.id}-${actualDay.slug}`} session={session} day={actualDay} date={date} exercises={new Map(Object.entries(exerciseMap))} allData={data.exercises} swaps={data.swaps} onSaveWorkout={saveWorkout} onAddPerformance={addPerformance} onSwap={recordSwap} onChangeWorkout={() => { router.push("/my-training"); }} />
  </section>;
}
