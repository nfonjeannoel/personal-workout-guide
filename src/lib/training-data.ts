export const TRAINING_DATA_KEY = "ff-training-data-v2";
export const TRAINING_DATA_VERSION = 2;

export interface LoggedSet {
  reps: number | null;
  rir: number | null;
  completed: boolean;
}

export interface ExercisePerformance {
  id: string;
  performedAt: string;
  weight: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface ExerciseRecord {
  favorite: boolean;
  notes: string;
  history: ExercisePerformance[];
  updatedAt: string;
}

export interface WorkoutRecord {
  id: string;
  daySlug: string;
  weekKey: string;
  completedExercises: string[];
  completedAt?: string;
  updatedAt: string;
}

export interface ExerciseSwap {
  id: string;
  originalSlug: string;
  replacementSlug: string;
  daySlug?: string;
  swappedAt: string;
}

export interface TrainingData {
  version: number;
  exercises: Record<string, ExerciseRecord>;
  workouts: WorkoutRecord[];
  swaps: ExerciseSwap[];
  recent: string[];
  settings: {
    timerSound: boolean;
  };
  updatedAt: string;
}

export function emptyTrainingData(): TrainingData {
  return {
    version: TRAINING_DATA_VERSION,
    exercises: {},
    workouts: [],
    swaps: [],
    recent: [],
    settings: { timerSound: true },
    updatedAt: new Date(0).toISOString(),
  };
}

export function normalizeTrainingData(value: unknown): TrainingData {
  const empty = emptyTrainingData();
  if (!value || typeof value !== "object") return empty;
  const data = value as Partial<TrainingData>;
  const exercises: Record<string, ExerciseRecord> = {};
  if (data.exercises && typeof data.exercises === "object") {
    for (const [slug, raw] of Object.entries(data.exercises)) {
      if (!raw || typeof raw !== "object" || slug.length > 120) continue;
      const candidate = raw as Partial<ExerciseRecord>;
      const history = Array.isArray(candidate.history) ? candidate.history.flatMap((item) => {
        if (!item || typeof item !== "object" || typeof item.id !== "string" || typeof item.performedAt !== "string" || !Array.isArray(item.sets)) return [];
        const sets = item.sets.slice(0, 20).flatMap((set) => {
          if (!set || typeof set !== "object") return [];
          return [{ reps: typeof set.reps === "number" && Number.isFinite(set.reps) ? Math.max(0, Math.min(100, Math.round(set.reps))) : null, rir: typeof set.rir === "number" && Number.isFinite(set.rir) ? Math.max(0, Math.min(10, Math.round(set.rir))) : null, completed: Boolean(set.completed) }];
        });
        return [{ id: item.id.slice(0, 120), performedAt: item.performedAt.slice(0, 40), weight: typeof item.weight === "string" ? item.weight.slice(0, 100) : "", sets, notes: typeof item.notes === "string" ? item.notes.slice(0, 2_000) : undefined }];
      }).slice(0, 100) : [];
      exercises[slug] = { favorite: Boolean(candidate.favorite), notes: typeof candidate.notes === "string" ? candidate.notes.slice(0, 5_000) : "", history, updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt.slice(0, 40) : new Date(0).toISOString() };
    }
  }
  return {
    ...empty,
    ...data,
    version: TRAINING_DATA_VERSION,
    exercises,
    workouts: Array.isArray(data.workouts) ? data.workouts.filter((item): item is WorkoutRecord => Boolean(item && typeof item.id === "string" && typeof item.daySlug === "string" && typeof item.weekKey === "string" && Array.isArray(item.completedExercises) && typeof item.updatedAt === "string")).slice(0, 250) : [],
    swaps: Array.isArray(data.swaps) ? data.swaps.filter((item): item is ExerciseSwap => Boolean(item && typeof item.id === "string" && typeof item.originalSlug === "string" && typeof item.replacementSlug === "string" && typeof item.swappedAt === "string")).slice(0, 250) : [],
    recent: Array.isArray(data.recent) ? data.recent.filter((item): item is string => typeof item === "string").slice(0, 12) : [],
    settings: { ...empty.settings, ...(data.settings ?? {}) },
  };
}

export function mergeTrainingData(local: TrainingData, remote: TrainingData): TrainingData {
  const exerciseSlugs = new Set([...Object.keys(remote.exercises), ...Object.keys(local.exercises)]);
  const exercises: Record<string, ExerciseRecord> = {};

  for (const slug of exerciseSlugs) {
    const left = local.exercises[slug];
    const right = remote.exercises[slug];
    if (!left) {
      exercises[slug] = right;
      continue;
    }
    if (!right) {
      exercises[slug] = left;
      continue;
    }
    const latest = Date.parse(left.updatedAt) >= Date.parse(right.updatedAt) ? left : right;
    const performances = new Map([...right.history, ...left.history].map((item) => [item.id, item]));
    exercises[slug] = {
      ...latest,
      favorite: left.favorite || right.favorite,
      history: [...performances.values()].sort((a, b) => Date.parse(b.performedAt) - Date.parse(a.performedAt)).slice(0, 100),
    };
  }

  const workouts = new Map([...remote.workouts, ...local.workouts].map((item) => [item.id, item]));
  const swaps = new Map([...remote.swaps, ...local.swaps].map((item) => [item.id, item]));
  const updatedAt = Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local.updatedAt : remote.updatedAt;

  return {
    version: TRAINING_DATA_VERSION,
    exercises,
    workouts: [...workouts.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 250),
    swaps: [...swaps.values()].sort((a, b) => Date.parse(b.swappedAt) - Date.parse(a.swappedAt)).slice(0, 250),
    recent: [...new Set([...local.recent, ...remote.recent])].slice(0, 12),
    settings: { ...remote.settings, ...local.settings },
    updatedAt,
  };
}

export function nextProgressionTarget(record: ExerciseRecord | undefined, repRange: string) {
  const latest = record?.history[0];
  if (!latest || latest.sets.length === 0) return "Log your first working sets";
  const bounds = repRange.match(/(\d+)\s*[-–]\s*(\d+)/);
  const maximum = bounds ? Number(bounds[2]) : null;
  const completed = latest.sets.filter((set) => set.completed && set.reps !== null);
  if (!completed.length) return `Repeat ${latest.weight || "the same load"} and complete every set`;
  if (maximum && completed.every((set) => (set.reps ?? 0) >= maximum)) {
    return `Increase slightly from ${latest.weight || "your last load"} and restart near the bottom of the range`;
  }
  const nextReps = completed.map((set) => Math.min((set.reps ?? 0) + 1, maximum ?? Number.MAX_SAFE_INTEGER));
  return `${latest.weight || "Same load"}: aim for ${nextReps.join(", ")} reps`;
}
