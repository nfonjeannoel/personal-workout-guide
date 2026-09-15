import { describe, expect, it } from "vitest";
import { exercises } from "@/data/exercises";

import { emptyTrainingData, normalizeTrainingData, rebuildSessionHistory, suggestAlternative, mergeTrainingData, nextProgressionTarget, workoutDate, type ExerciseRecord } from "@/lib/training-data";

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


describe("session editing and persistence", () => {
  const session = () => ({ id: "session-a", daySlug: "day-1", weekKey: "2026-09-14", date: "2026-09-14", completedExercises: ["press"], exerciseLogs: { press: { exerciseSlug: "press", weight: "50 kg", sets: [{ reps: 10, rir: 2, completed: true }, { reps: null, rir: null, completed: false }], updatedAt: "2026-09-14T12:00:00.000Z" } }, updatedAt: "2026-09-14T12:00:00.000Z" });

  it("round trips custom exercises, extra sets, and deletion markers", () => {
    const data = emptyTrainingData();
    data.workouts = [{ ...session(), deletedAt: "2026-09-14T13:00:00.000Z", plan: { day: 0, slug: "custom", label: "Custom", title: "Evening workout", emphasis: "", estimatedMinutes: "", type: "training", exercises: [{ exerciseSlug: "custom-carry", name: "Sandbag carry", sets: "4", reps: "20 steps", rest: "As needed" }] } }];
    const restored = normalizeTrainingData(JSON.parse(JSON.stringify(data)));
    expect(restored.workouts[0].plan?.exercises[0].name).toBe("Sandbag carry");
    expect(restored.workouts[0].exerciseLogs?.press.sets).toHaveLength(2);
    expect(restored.workouts[0].deletedAt).toBeTruthy();
  });

  it("updates linked history without duplicating saves and moves its date", () => {
    const data = emptyTrainingData(); data.workouts = [session()];
    const initial = rebuildSessionHistory(data);
    initial.workouts[0] = { ...initial.workouts[0], date: "2026-09-12" };
    const edited = rebuildSessionHistory(rebuildSessionHistory(initial));
    expect(edited.exercises.press.history).toHaveLength(1);
    expect(edited.exercises.press.history[0].performedAt).toContain("2026-09-12");
    expect(edited.exercises.press.history[0].sets[1].completed).toBe(false);
  });

  it("does not resurrect a deleted session or its history when merging a stale account", () => {
    const remote = emptyTrainingData(); remote.workouts = [session()];
    const populated = rebuildSessionHistory(remote);
    const local = structuredClone(populated);
    local.workouts[0] = { ...local.workouts[0], deletedAt: "2026-09-14T14:00:00.000Z", updatedAt: "2026-09-14T14:00:00.000Z" };
    for (const merged of [mergeTrainingData(local, populated), mergeTrainingData(populated, local)]) {
      expect(merged.workouts[0].deletedAt).toBeTruthy();
      expect(merged.exercises.press.history).toHaveLength(0);
    }
  });

  it("removes old history when a session exercise is removed", () => {
    const data = emptyTrainingData(); data.workouts = [session()];
    const populated = rebuildSessionHistory(data);
    populated.workouts[0].exerciseLogs = {};
    expect(rebuildSessionHistory(populated).exercises.press.history).toHaveLength(0);
  });

  it("suggests unused alternatives and avoids exercises already in the session", () => {
    expect(suggestAlternative("press", ["row", "fly", "incline"], { fly: record([10]) }, ["row"])).toBe("incline");
    expect(suggestAlternative("press", ["row"], {}, ["row"])).toBeUndefined();
  });
});


it("does not suggest increasing load while added sets remain unfinished", () => {
  const partial = record([12]);
  partial.history[0].sets.push({ reps: null, rir: null, completed: false });
  expect(nextProgressionTarget(partial, "8–12 reps")).not.toContain("Increase");
});


it("keeps alternatives within the same muscle, movement, and compound/isolation category", () => {
  const bySlug = new Map(exercises.map((exercise) => [exercise.slug, exercise]));
  for (const exercise of exercises) {
    for (const slug of exercise.alternatives) {
      const alternative = bySlug.get(slug)!;
      expect([alternative.muscleGroup, alternative.movementPattern, alternative.mechanic]).toEqual([exercise.muscleGroup, exercise.movementPattern, exercise.mechanic]);
    }
  }
  expect(bySlug.get("lateral-raise-machine")?.alternatives).not.toContain("arnold-press");
});
