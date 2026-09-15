"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useSession } from "@/lib/auth-client";
import {
  TRAINING_DATA_KEY,
  rebuildSessionHistory,
  emptyTrainingData,
  mergeTrainingData,
  normalizeTrainingData,
  type ExercisePerformance,
  type ExerciseRecord,
  type ExerciseSwap,
  type TrainingData,
  type WorkoutRecord,
} from "@/lib/training-data";

interface TrainingDataContextValue {
  data: TrainingData;
  hydrated: boolean;
  syncState: "device" | "syncing" | "synced" | "error";
  updateExercise: (slug: string, update: Partial<Pick<ExerciseRecord, "favorite" | "notes">>) => void;
  addPerformance: (slug: string, performance: ExercisePerformance) => void;
  markRecent: (slug: string) => void;
  saveWorkout: (record: WorkoutRecord) => void;
  deleteWorkout: (id: string) => void;
  recordSwap: (swap: ExerciseSwap) => void;
  replaceData: (data: TrainingData) => void;
}

const TrainingDataContext = createContext<TrainingDataContextValue | null>(null);

function withTimestamp(data: TrainingData): TrainingData {
  return { ...data, updatedAt: new Date().toISOString() };
}

function migrateLegacyStorage() {
  const migrated = emptyTrainingData();
  try {
    const current = window.localStorage.getItem(TRAINING_DATA_KEY);
    if (current) return normalizeTrainingData(JSON.parse(current));

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      if (key.startsWith("ff-exercise-")) {
        const slug = key.slice("ff-exercise-".length);
        const legacy = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
        const reps = String(legacy.reps ?? "").split(",").map((value) => Number(value.trim())).filter(Number.isFinite);
        const updatedAt = typeof legacy.updatedAt === "string" ? legacy.updatedAt : new Date().toISOString();
        migrated.exercises[slug] = {
          favorite: Boolean(legacy.favorite),
          notes: String(legacy.notes ?? ""),
          updatedAt,
          history: legacy.weight || reps.length ? [{
            id: `legacy-${slug}-${Date.parse(updatedAt) || Date.now()}`,
            performedAt: updatedAt,
            weight: String(legacy.weight ?? ""),
            sets: reps.map((value) => ({ reps: value, rir: null, completed: true })),
          }] : [],
        };
      }
      if (key.startsWith("ff-workout-")) {
        const match = key.match(/^ff-workout-(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (!match) continue;
        const completedExercises = JSON.parse(window.localStorage.getItem(key) ?? "[]");
        if (!Array.isArray(completedExercises)) continue;
        migrated.workouts.push({
          id: `${match[1]}-${match[2]}`,
          weekKey: match[1],
          daySlug: match[2],
          completedExercises: completedExercises.filter((value): value is string => typeof value === "string"),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    const recent = JSON.parse(window.localStorage.getItem("ff-recent") ?? "[]");
    migrated.recent = Array.isArray(recent) ? recent.filter((value): value is string => typeof value === "string").slice(0, 12) : [];
  } catch {
    return migrated;
  }
  return withTimestamp(migrated);
}

export function TrainingDataProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [data, setData] = useState<TrainingData>(() => emptyTrainingData());
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<TrainingDataContextValue["syncState"]>("device");
  const cloudReady = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next = migrateLegacyStorage();
      setData(next);
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const serialized = JSON.stringify(data);
      if (window.localStorage.getItem(TRAINING_DATA_KEY) !== serialized) window.localStorage.setItem(TRAINING_DATA_KEY, serialized);
    } catch {
      // In-memory tracking remains available when browser storage is blocked.
    }
  }, [data, hydrated]);

  useEffect(() => {
    function receiveStorage(event: StorageEvent) {
      if (event.key !== TRAINING_DATA_KEY || !event.newValue) return;
      try { setData(normalizeTrainingData(JSON.parse(event.newValue))); } catch { /* Ignore incomplete external writes. */ }
    }
    window.addEventListener("storage", receiveStorage);
    return () => window.removeEventListener("storage", receiveStorage);
  }, []);

  useEffect(() => {
    if (!hydrated || !session?.user) {
      cloudReady.current = false;
      const frame = window.requestAnimationFrame(() => setSyncState("device"));
      return () => window.cancelAnimationFrame(frame);
    }
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => setSyncState("syncing"));
    void fetch("/api/user-data", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load account data");
        const result = await response.json() as { data: unknown };
        setData((current) => withTimestamp(mergeTrainingData(current, normalizeTrainingData(result.data))));
        cloudReady.current = true;
        setSyncState("synced");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSyncState("error");
      });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
    // The session identity is the synchronization boundary. Local changes sync in the separate effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, session?.user.id]);

  useEffect(() => {
    if (!hydrated || !session?.user || !cloudReady.current) return;
    setSyncState("syncing");
    const timeout = window.setTimeout(() => {
      void fetch("/api/user-data", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data }),
      }).then((response) => {
        if (!response.ok) throw new Error("Unable to save account data");
        setSyncState("synced");
      }).catch(() => setSyncState("error"));
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [data, hydrated, session?.user]);

  const updateExercise = useCallback((slug: string, update: Partial<Pick<ExerciseRecord, "favorite" | "notes">>) => {
    setData((current) => {
      const previous = current.exercises[slug] ?? { favorite: false, notes: "", history: [], updatedAt: new Date(0).toISOString() };
      const now = new Date().toISOString();
      return withTimestamp({ ...current, exercises: { ...current.exercises, [slug]: { ...previous, ...update, updatedAt: now } } });
    });
  }, []);

  const addPerformance = useCallback((slug: string, performance: ExercisePerformance) => {
    setData((current) => {
      const previous = current.exercises[slug] ?? { favorite: false, notes: "", history: [], updatedAt: new Date(0).toISOString() };
      const next = { ...previous, history: [performance, ...previous.history.filter((item) => item.id !== performance.id)].slice(0, 100), updatedAt: performance.performedAt };
      return withTimestamp({ ...current, exercises: { ...current.exercises, [slug]: next } });
    });
  }, []);

  const markRecent = useCallback((slug: string) => {
    setData((current) => withTimestamp({ ...current, recent: [slug, ...current.recent.filter((item) => item !== slug)].slice(0, 12) }));
  }, []);

  const saveWorkout = useCallback((record: WorkoutRecord) => {
    setData((current) => {
      const previous = current.workouts.find((item) => item.id === record.id);
      if (previous?.deletedAt) return current;
      return withTimestamp(rebuildSessionHistory({ ...current, workouts: [{ ...previous, ...record }, ...current.workouts.filter((item) => item.id !== record.id)].slice(0, 250) }));
    });
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setData((current) => withTimestamp(rebuildSessionHistory({ ...current, workouts: current.workouts.map((item) => item.id === id ? { ...item, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item) })));
  }, []);

  const recordSwap = useCallback((swap: ExerciseSwap) => {
    setData((current) => withTimestamp({ ...current, swaps: [swap, ...current.swaps.filter((item) => item.id !== swap.id)].slice(0, 250) }));
  }, []);

  const replaceData = useCallback((replacement: TrainingData) => setData(withTimestamp(normalizeTrainingData(replacement))), []);

  const value = useMemo(() => ({ data: { ...data, workouts: data.workouts.filter((item) => !item.deletedAt) }, hydrated, syncState, updateExercise, addPerformance, markRecent, saveWorkout, deleteWorkout, recordSwap, replaceData }), [addPerformance, deleteWorkout, data, hydrated, markRecent, recordSwap, replaceData, saveWorkout, syncState, updateExercise]);
  return <TrainingDataContext.Provider value={value}>{children}</TrainingDataContext.Provider>;
}

export function useTrainingData() {
  const context = useContext(TrainingDataContext);
  if (!context) throw new Error("useTrainingData must be used inside TrainingDataProvider");
  return context;
}
