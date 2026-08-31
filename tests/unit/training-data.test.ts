import { describe, expect, it } from "vitest";

import { emptyTrainingData, mergeTrainingData, nextProgressionTarget, workoutDate, type ExerciseRecord } from "@/lib/training-data";

const record = (reps: number[]): ExerciseRecord => ({
  favorite: false,
  notes: "seat 4",
  updatedAt: "2026-08-30T12:00:00.000Z",
  history: [{ id: "set-1", performedAt: "2026-08-30T12:00:00.000Z", weight: "50 kg", sets: reps.map((value) => ({ reps: value, rir: 2, completed: true })) }],
});

describe("nextProgressionTarget", () => {
  it("adds a repetition to each set inside the range", () => {
    expect(nextProgressionTarget(record([10, 9, 8]), "8–12 reps")).toBe("50 kg: aim for 11, 10, 9 reps");
  });

  it("recommends a load increase after all sets reach the top", () => {
    expect(nextProgressionTarget(record([12, 12, 12]), "8–12 reps")).toContain("Increase slightly from 50 kg");
  });
});

describe("mergeTrainingData", () => {
  it("preserves unique histories, favorites, workouts, and recent items", () => {
    const local = emptyTrainingData();
    local.exercises.press = { ...record([10]), favorite: true };
    local.recent = ["press"];
    const remote = emptyTrainingData();
    remote.exercises.press = { ...record([9]), history: [{ ...record([9]).history[0], id: "set-2" }] };
    remote.recent = ["row"];
    const merged = mergeTrainingData(local, remote);
    expect(merged.exercises.press.favorite).toBe(true);
    expect(merged.exercises.press.history).toHaveLength(2);
    expect(merged.recent).toEqual(["press", "row"]);
  });

  it("keeps the newest calendar completion state while preserving exercise logs", () => {
    const local = emptyTrainingData();
    local.workouts = [{ id: "journal-2026-08-30", daySlug: "day-1", weekKey: "2026-08-24", date: "2026-08-30", completedExercises: [], exerciseLogs: {}, updatedAt: "2026-08-30T14:00:00.000Z" }];
    const remote = emptyTrainingData();
    remote.workouts = [{ id: "journal-2026-08-30", daySlug: "day-1", weekKey: "2026-08-24", date: "2026-08-30", completedExercises: ["machine-chest-press"], exerciseLogs: { "machine-chest-press": { exerciseSlug: "machine-chest-press", weight: "50 kg", sets: [{ reps: 10, rir: 2, completed: true }], updatedAt: "2026-08-30T13:00:00.000Z" } }, updatedAt: "2026-08-30T13:00:00.000Z" }];
    const merged = mergeTrainingData(local, remote);
    expect(merged.workouts[0].completedExercises).toEqual([]);
    expect(merged.workouts[0].exerciseLogs?.["machine-chest-press"].weight).toBe("50 kg");
  });
});

describe("workoutDate", () => {
  it("uses an explicit journal date", () => {
    expect(workoutDate({ id: "journal", daySlug: "day-4", weekKey: "2026-08-24", date: "2026-09-03", completedExercises: [], updatedAt: "2026-09-03T12:00:00.000Z" })).toBe("2026-09-03");
  });

  it("places legacy weekly sessions on their inferred calendar day", () => {
    expect(workoutDate({ id: "legacy", daySlug: "day-4", weekKey: "2026-08-24", completedExercises: [], updatedAt: "2026-08-27T12:00:00.000Z" })).toBe("2026-08-27");
  });
});
