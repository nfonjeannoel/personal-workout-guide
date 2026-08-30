import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExerciseLibrary } from "@/components/exercise-library";
import { equipmentTypes, exercises, movementPatterns, muscleGroups, slugify } from "@/data/exercises";

type Props = { params: Promise<{ muscle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return muscleGroups.map((muscle) => ({ muscle: slugify(muscle) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).muscle;
  const muscle = muscleGroups.find((item) => slugify(item) === slug);
  return muscle ? { title: `${muscle} Exercises`, description: `Browse ${muscle.toLowerCase()} exercises with form guides and equipment alternatives.` } : {};
}

export default async function MusclePage({ params }: Props) {
  const slug = (await params).muscle;
  const muscle = muscleGroups.find((item) => slugify(item) === slug);
  if (!muscle) notFound();
  const items = exercises.map((exercise) => ({
    slug: exercise.slug,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    movementPattern: exercise.movementPattern,
    difficulty: exercise.difficulty,
    repRange: exercise.recommendedRepRange,
    image: exercise.images[0].src,
  }));
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Exercise encyclopedia</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{muscle} exercises</h1>
      <p className="mb-8 mt-3 text-muted-foreground">Filter variations by equipment, difficulty, and movement pattern.</p>
      <ExerciseLibrary items={items} muscleGroups={muscleGroups} equipmentTypes={equipmentTypes} movementPatterns={movementPatterns} initialMuscle={muscle} />
    </main>
  );
}
