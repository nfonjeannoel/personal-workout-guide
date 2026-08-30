import type { Metadata } from "next";

import { MyTrainingDashboard } from "@/components/my-training-dashboard";
import { exercises } from "@/data/exercises";

export const metadata: Metadata = { title: "My Training", description: "Your favorite exercises, recent guides, workout history, and personal records." };

export default function MyTrainingPage() {
  const summaries = exercises.map((exercise) => ({ slug: exercise.slug, name: exercise.name, muscleGroup: exercise.muscleGroup, image: exercise.images[0].src }));
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Private to you</p><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">My training</h1><p className="mb-10 mt-4 max-w-2xl leading-7 text-muted-foreground">Fast access to the exercises and records you actually use.</p><MyTrainingDashboard exercises={summaries} /></main>;
}
