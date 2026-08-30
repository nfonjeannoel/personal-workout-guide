import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { WorkoutSession } from "@/components/workout-session";
import { Button } from "@/components/ui/button";
import { exercises } from "@/data/exercises";
import { workoutBySlug, workoutDays } from "@/data/workouts";

type Props = { params: Promise<{ day: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return workoutDays.map((day) => ({ day: day.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const day = workoutBySlug.get((await params).day);
  return day ? { title: `${day.label} — ${day.title}`, description: `${day.emphasis}: the complete ${day.title} workout with sets, reps, rest, and exercise form guides.` } : {};
}

export default async function WorkoutDayPage({ params }: Props) {
  const day = workoutBySlug.get((await params).day);
  if (!day) notFound();
  const exerciseMap = Object.fromEntries(exercises.map((exercise) => [exercise.slug, {
    slug: exercise.slug,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    image: exercise.images[0].src,
    repRange: exercise.recommendedRepRange,
    alternatives: exercise.alternatives,
  }]));
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <Button variant="ghost" size="sm" className="-ml-2 mb-6 rounded-lg" render={<Link href="/workout" />}><ArrowLeft className="size-4" /> Weekly program</Button>
      <WorkoutSession day={day} exerciseMap={exerciseMap} />
    </main>
  );
}
