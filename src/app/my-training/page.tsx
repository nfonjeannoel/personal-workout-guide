import type { Metadata } from "next";

import { MyTrainingDashboard } from "@/components/my-training-dashboard";
import { exercises } from "@/data/exercises";

export const metadata: Metadata = { title: "Training Journal & Calendar", description: "Plan workouts by date, track every set, and review your complete personal training log." };

export default function MyTrainingPage() {
  const summaries = exercises.map((exercise) => ({ slug: exercise.slug, name: exercise.name, muscleGroup: exercise.muscleGroup, image: exercise.images[0].src, repRange: exercise.recommendedRepRange, alternatives: exercise.alternatives }));
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">Private to you</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Training journal</h1><p className="mb-8 mt-4 max-w-2xl leading-7 text-muted-foreground">Choose what you trained, work through the session, and build a calendar you can actually learn from.</p><MyTrainingDashboard exercises={summaries} /></main>;
}
