import { workoutDays, type WorkoutDay } from "@/data/workouts";

export const TRAINING_DATA_KEY = "ff-training-data-v2";
export const TRAINING_DATA_VERSION = 4;

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
  plan?: WorkoutDay;
  deletedAt?: string;
  id: string;
  daySlug: string;
  weekKey: string;
  date?: string;
  startedAt?: string;
  completedExercises: string[];
  exerciseLogs?: Record<string, JournalExerciseLog>;
  notes?: string;
  feeling?: "rough" | "steady" | "strong";
  completedAt?: string;
  updatedAt: string;
}

export interface JournalExerciseLog {
  exerciseSlug: string;
  weight: string;
  sets: LoggedSet[];
  notes?: string;
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
        return [{ id: item.id.slice(0, 300), performedAt: item.performedAt.slice(0, 40), weight: typeof item.weight === "string" ? item.weight.slice(0, 100) : "", sets, notes: typeof item.notes === "string" ? item.notes.slice(0, 2_000) : undefined }];
      }).slice(0, 100) : [];
      exercises[slug] = { favorite: Boolean(candidate.favorite), notes: typeof candidate.notes === "string" ? candidate.notes.slice(0, 5_000) : "", history, updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt.slice(0, 40) : new Date(0).toISOString() };
    }
  }
  const workouts = Array.isArray(data.workouts) ? data.workouts.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<WorkoutRecord>;
    if (typeof candidate.id !== "string" || typeof candidate.daySlug !== "string" || typeof candidate.weekKey !== "string" || !Array.isArray(candidate.completedExercises) || typeof candidate.updatedAt !== "string") return [];
    const exerciseLogs: Record<string, JournalExerciseLog> = {};
    if (candidate.exerciseLogs && typeof candidate.exerciseLogs === "object") {
      for (const [originalSlug, rawLog] of Object.entries(candidate.exerciseLogs)) {
        if (!rawLog || typeof rawLog !== "object" || originalSlug.length > 120) continue;
        const log = rawLog as Partial<JournalExerciseLog>;
        if (typeof log.exerciseSlug !== "string" || typeof log.updatedAt !== "string" || !Array.isArray(log.sets)) continue;
        exerciseLogs[originalSlug] = {
          exerciseSlug: log.exerciseSlug.slice(0, 120),
          weight: typeof log.weight === "string" ? log.weight.slice(0, 100) : "",
          sets: log.sets.slice(0, 20).flatMap((set) => {
            if (!set || typeof set !== "object") return [];
            return [{ reps: typeof set.reps === "number" && Number.isFinite(set.reps) ? Math.max(0, Math.min(100, Math.round(set.reps))) : null, rir: typeof set.rir === "number" && Number.isFinite(set.rir) ? Math.max(0, Math.min(10, Math.round(set.rir))) : null, completed: Boolean(set.completed) }];
          }),
          notes: typeof log.notes === "string" ? log.notes.slice(0, 2_000) : undefined,
          updatedAt: log.updatedAt.slice(0, 40),
        };
      }
    }
    const feeling = candidate.feeling === "rough" || candidate.feeling === "steady" || candidate.feeling === "strong" ? candidate.feeling : undefined;
    return [{
      plan: normalizePlan(candidate.plan),
      deletedAt: typeof candidate.deletedAt === "string" ? candidate.deletedAt.slice(0, 40) : undefined,
      id: candidate.id.slice(0, 160),
      daySlug: candidate.daySlug.slice(0, 80),
      weekKey: candidate.weekKey.slice(0, 20),
      date: typeof candidate.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate.date) ? candidate.date : undefined,
      startedAt: typeof candidate.startedAt === "string" ? candidate.startedAt.slice(0, 40) : undefined,
      completedExercises: candidate.completedExercises.filter((entry): entry is string => typeof entry === "string").slice(0, 30),
      exerciseLogs,
      notes: typeof candidate.notes === "string" ? candidate.notes.slice(0, 5_000) : undefined,
      feeling,
      completedAt: typeof candidate.completedAt === "string" ? candidate.completedAt.slice(0, 40) : undefined,
      updatedAt: candidate.updatedAt.slice(0, 40),
    } satisfies WorkoutRecord];
  }).slice(0, 250) : [];
  return {
    ...empty,
    ...data,
    version: TRAINING_DATA_VERSION,
    exercises,
    workouts,
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

  const workouts = new Map<string, WorkoutRecord>();
  for (const item of [...remote.workouts, ...local.workouts]) {
    const existing = workouts.get(item.id);
    if (!existing) {
      workouts.set(item.id, item);
      continue;
    }
    const latest = Date.parse(item.updatedAt) >= Date.parse(existing.updatedAt) ? item : existing;
    const logs: Record<string, JournalExerciseLog> = { ...(existing.exerciseLogs ?? {}) };
    for (const [slug, log] of Object.entries(item.exerciseLogs ?? {})) {
      if (!logs[slug] || Date.parse(log.updatedAt) >= Date.parse(logs[slug].updatedAt)) logs[slug] = log;
    }
    workouts.set(item.id, { ...latest, exerciseLogs: latest.deletedAt || latest.plan ? latest.exerciseLogs : logs });
  }
  const swaps = new Map([...remote.swaps, ...local.swaps].map((item) => [item.id, item]));
  const updatedAt = Date.parse(local.updatedAt) >= Date.parse(remote.updatedAt) ? local.updatedAt : remote.updatedAt;

  return rebuildSessionHistory({
    version: TRAINING_DATA_VERSION,
    exercises,
    workouts: [...workouts.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 250),
    swaps: [...swaps.values()].sort((a, b) => Date.parse(b.swappedAt) - Date.parse(a.swappedAt)).slice(0, 250),
    recent: [...new Set([...local.recent, ...remote.recent])].slice(0, 12),
    settings: { ...remote.settings, ...local.settings },
    updatedAt,
  });
}

export function workoutDate(record: WorkoutRecord) {
  if (record.date && /^\d{4}-\d{2}-\d{2}$/.test(record.date)) return record.date;
  const dayNumber = Number(record.daySlug.match(/day-(\d+)/)?.[1]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.weekKey) || !Number.isFinite(dayNumber)) return record.updatedAt.slice(0, 10);
  const [year, month, day] = record.weekKey.split("-").map(Number);
  const date = new Date(year, month - 1, day + Math.max(0, dayNumber - 1), 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function nextProgressionTarget(record: ExerciseRecord | undefined, repRange: string) {
  const latest = record?.history[0];
  if (!latest || latest.sets.length === 0) return "Log your first working sets";
  const bounds = repRange.match(/(\d+)\s*[-–]\s*(\d+)/);
  const maximum = bounds ? Number(bounds[2]) : null;
  const completed = latest.sets.filter((set) => set.completed && set.reps !== null);
  if (!completed.length) return `Repeat ${latest.weight || "the same load"} and complete every set`;
  if (maximum && completed.length === latest.sets.length && completed.every((set) => (set.reps ?? 0) >= maximum)) {
    return `Increase slightly from ${latest.weight || "your last load"} and restart near the bottom of the range`;
  }
  const nextReps = completed.map((set) => Math.min((set.reps ?? 0) + 1, maximum ?? Number.MAX_SAFE_INTEGER));
  return `${latest.weight || "Same load"}: aim for ${nextReps.join(", ")} reps`;
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function sessionDay(record: WorkoutRecord): WorkoutDay | undefined {
  return record.plan ?? workoutDays.find((day) => day.slug === record.daySlug);
}

function normalizePlan(value: unknown): WorkoutDay | undefined {
  if (!value || typeof value !== "object") return undefined;
  const plan = value as WorkoutDay;
  if (typeof plan.title !== "string" || typeof plan.slug !== "string" || !Array.isArray(plan.exercises)) return undefined;
  return {
    day: Number.isFinite(plan.day) ? plan.day : 0, slug: plan.slug.slice(0, 80),
    title: plan.title.slice(0, 120), label: String(plan.label ?? "Custom workout").slice(0, 120),
    emphasis: String(plan.emphasis ?? "").slice(0, 200), estimatedMinutes: String(plan.estimatedMinutes ?? "").slice(0, 80),
    type: plan.type === "recovery" || plan.type === "rest" ? plan.type : "training",
    recovery: Array.isArray(plan.recovery) ? plan.recovery.filter((item) => typeof item === "string").slice(0, 30) : undefined,
    exercises: plan.exercises.flatMap((item) => !item || typeof item.exerciseSlug !== "string" ? [] : [{
      exerciseSlug: item.exerciseSlug.slice(0, 120), name: typeof item.name === "string" ? item.name.slice(0, 120) : undefined,
      sets: String(item.sets ?? "3").slice(0, 20), reps: String(item.reps ?? "8–12").slice(0, 40), rest: String(item.rest ?? "As needed").slice(0, 40),
      note: typeof item.note === "string" ? item.note.slice(0, 500) : undefined,
    }]).slice(0, 30),
  };
}

// Session logs are the source of truth for linked exercise history, including edits and deletions.
export function rebuildSessionHistory(data: TrainingData): TrainingData {
  const exercises = { ...data.exercises };
  const prefixes = data.workouts.map((session) => `${session.id}-`);
  for (const [slug, record] of Object.entries(exercises)) {
    exercises[slug] = { ...record, history: record.history.filter((entry) => !prefixes.some((prefix) => entry.id.startsWith(prefix))) };
  }
  for (const session of data.workouts) {
    if (session.deletedAt) continue;
    for (const [slot, log] of Object.entries(session.exerciseLogs ?? {})) {
      if (!log.sets.some((set) => set.completed)) continue;
      const previous = exercises[log.exerciseSlug] ?? { favorite: false, notes: "", history: [], updatedAt: log.updatedAt };
      const performedAt = new Date(`${workoutDate(session)}T12:00:00`).toISOString();
      exercises[log.exerciseSlug] = { ...previous, history: [...previous.history, { id: `${session.id}-${slot}`, performedAt, weight: log.weight, sets: log.sets, notes: log.notes }].sort((a,b) => b.performedAt.localeCompare(a.performedAt)).slice(0,100) };
    }
  }
  return { ...data, exercises };
}

export function suggestAlternative(original: string, alternatives: string[], history: TrainingData["exercises"], excluded: string[] = []) {
  return alternatives.filter((slug) => slug !== original && !excluded.includes(slug)).sort((a, b) => {
    const last = (slug: string) => history[slug]?.history[0]?.performedAt ?? "";
    return last(a).localeCompare(last(b)) || a.localeCompare(b);
  })[0];
}
