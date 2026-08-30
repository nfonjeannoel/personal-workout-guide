import type { Metadata } from "next";

import { ExerciseLibrary } from "@/components/exercise-library";
import { equipmentTypes, exercises, movementPatterns, muscleGroups } from "@/data/exercises";

export const metadata: Metadata = {
  title: "Exercise Library",
  description: "Search more than 100 gym exercises by muscle, equipment, difficulty, and movement pattern.",
};

export default function ExercisesPage() {
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
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Exercise encyclopedia</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Find the right movement.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Search by exercise, muscle, equipment, or movement pattern. Every entry includes setup, form cues, common mistakes, and gym-ready alternatives.</p>
      </div>
      <ExerciseLibrary
        items={items}
        muscleGroups={muscleGroups}
        equipmentTypes={equipmentTypes}
        movementPatterns={movementPatterns}
      />
    </main>
  );
}
