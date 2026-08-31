"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Dumbbell,
  Flame,
  Heart,
  History,
  NotebookPen,
  Plus,
  Repeat2,
  Shuffle,
  Sparkles,
  Target,
} from "lucide-react";

import { RestTimer } from "@/components/rest-timer";
import { useTrainingData } from "@/components/training-data-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { workoutDays, type WorkoutDay, type WorkoutExercise } from "@/data/workouts";
import {
  nextProgressionTarget,
  workoutDate,
  type ExercisePerformance,
  type JournalExerciseLog,
  type LoggedSet,
  type WorkoutRecord,
} from "@/lib/training-data";

interface TrainingExercise {
  slug: string;
  name: string;
  muscleGroup: string;
  image: string;
  repRange: string;
  alternatives: string[];
}

const journalChoices = workoutDays.filter((day) => day.type !== "rest");
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function mondayKey(value: string) {
  const date = dateFromKey(value);
  const offset = date.getDay() === 0 ? -6 : 1 - date.getDay();
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

function monthCells(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const start = new Date(first);
  start.setDate(first.getDate() - (first.getDay() === 0 ? 6 : first.getDay() - 1));
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { key: dateKey(date), day: date.getDate(), inMonth: date.getMonth() === month.getMonth(), date };
  });
}

function sessionStatus(record: WorkoutRecord | undefined, total: number) {
  if (!record) return "none" as const;
  if (record.completedAt || (total > 0 && record.completedExercises.length >= total)) return "complete" as const;
  if (record.completedExercises.length || Object.keys(record.exerciseLogs ?? {}).length) return "active" as const;
  return "planned" as const;
}

function totalItems(day: WorkoutDay) {
  return day.type === "training" ? day.exercises.length : day.recovery?.length ?? 0;
}

function performanceDate(value: string) {
  return dateFromKey(value).toISOString();
}

export function MyTrainingDashboard({ exercises }: { exercises: TrainingExercise[] }) {
  const { data, hydrated, saveWorkout, addPerformance, recordSwap } = useTrainingData();
  const today = dateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12));
  const [choosingDate, setChoosingDate] = useState<string | null>(null);
  const exerciseMap = useMemo(() => new Map(exercises.map((exercise) => [exercise.slug, exercise])), [exercises]);
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutRecord[]>();
    for (const record of data.workouts) {
      const key = workoutDate(record);
      map.set(key, [...(map.get(key) ?? []), record].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)));
    }
    return map;
  }, [data.workouts]);
  const selectedSession = sessionsByDate.get(selectedDate)?.[0];
  const selectedDay = selectedSession ? workoutDays.find((day) => day.slug === selectedSession.daySlug) : undefined;
  const cells = useMemo(() => monthCells(viewMonth), [viewMonth]);
  const monthPrefix = `${viewMonth.getFullYear()}-${String(viewMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthSessions = data.workouts.filter((record) => workoutDate(record).startsWith(monthPrefix));
  const monthCompleted = monthSessions.filter((record) => {
    const day = workoutDays.find((item) => item.slug === record.daySlug);
    return sessionStatus(record, day ? totalItems(day) : 0) === "complete";
  }).length;

  function selectDate(key: string) {
    setSelectedDate(key);
    setChoosingDate(null);
    const next = dateFromKey(key);
    if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1, 12));
  }

  function startSession(day: WorkoutDay) {
    const now = new Date().toISOString();
    const existing = selectedSession;
    saveWorkout({
      id: existing?.id ?? `journal-${selectedDate}`,
      daySlug: day.slug,
      weekKey: mondayKey(selectedDate),
      date: selectedDate,
      startedAt: selectedDate <= today ? existing?.startedAt ?? now : existing?.startedAt,
      completedExercises: existing?.daySlug === day.slug ? existing.completedExercises : [],
      exerciseLogs: existing?.daySlug === day.slug ? existing.exerciseLogs ?? {} : {},
      notes: existing?.notes,
      feeling: existing?.feeling,
      updatedAt: now,
    });
    setChoosingDate(null);
  }

  if (!hydrated) return <div className="grid gap-5 lg:grid-cols-[22rem_1fr]"><div className="h-[31rem] animate-pulse rounded-3xl bg-muted" /><div className="h-[31rem] animate-pulse rounded-3xl bg-muted" /></div>;

  return (
    <div className="space-y-12">
      <div className="grid items-start gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-3xl border border-border bg-card p-4 sm:p-5" aria-labelledby="calendar-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-foreground">Training calendar</p>
                <h2 id="calendar-heading" className="mt-1 text-xl font-semibold">{new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(viewMonth)}</h2>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1, 12))}><ChevronLeft /></Button>
                <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1, 12))}><ChevronRight /></Button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" aria-hidden="true">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="mt-2 grid grid-cols-7 gap-1" role="grid" aria-label="Workout dates">
              {Array.from({ length: 6 }, (_, weekIndex) => <div key={weekIndex} role="row" className="contents">{cells.slice(weekIndex * 7, weekIndex * 7 + 7).map((cell) => {
                const record = sessionsByDate.get(cell.key)?.[0];
                const day = record ? workoutDays.find((item) => item.slug === record.daySlug) : undefined;
                const status = sessionStatus(record, day ? totalItems(day) : 0);
                const selected = selectedDate === cell.key;
                const current = today === cell.key;
                const statusLabel = status === "complete" ? "completed workout" : status === "active" ? "workout in progress" : status === "planned" ? "planned workout" : "no workout";
                return (
                  <button
                    key={cell.key}
                    type="button"
                    role="gridcell"
                    aria-selected={selected}
                    aria-label={`${new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(cell.date)}, ${statusLabel}`}
                    onClick={() => selectDate(cell.key)}
                    className={`relative grid min-h-11 place-items-center rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "bg-foreground text-background" : status === "complete" ? "bg-primary text-primary-foreground" : status === "active" ? "border border-primary/60 bg-primary/10 text-foreground" : "hover:bg-muted"} ${cell.inMonth ? "" : "text-muted-foreground"}`}
                  >
                    <span className={current && !selected ? "underline decoration-primary decoration-2 underline-offset-4" : ""}>{cell.day}</span>
                    {status === "planned" && <span className="absolute bottom-1 size-1 rounded-full bg-primary" />}
                  </button>
                );
              })}</div>)}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Complete</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-primary bg-primary/10" /> In progress</span>
              <Button variant="ghost" size="xs" className="ml-auto" onClick={() => selectDate(today)}>Today</Button>
            </div>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4"><Flame className="size-4 text-primary" /><strong className="mt-3 block text-2xl">{monthSessions.length}</strong><span className="text-xs text-muted-foreground">sessions this month</span></div>
            <div className="rounded-2xl border border-border bg-card p-4"><CircleCheckBig className="size-4 text-primary" /><strong className="mt-3 block text-2xl">{monthCompleted}</strong><span className="text-xs text-muted-foreground">fully completed</span></div>
          </section>
        </aside>

        <section className="min-w-0 rounded-3xl border border-border bg-card p-4 sm:p-6 lg:p-8" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-foreground">{selectedDate === today ? "Today" : selectedDate > today ? "Plan ahead" : "Journal entry"}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(dateFromKey(selectedDate))}</h2>
            </div>
            {selectedDay && <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">{selectedDay.title}</span>}
          </div>

          {!selectedSession || !selectedDay || choosingDate === selectedDate ? (
            <WorkoutChooser selectedDate={selectedDate} today={today} onChoose={startSession} />
          ) : (
            <SessionTracker
              key={selectedSession.id}
              session={selectedSession}
              day={selectedDay}
              date={selectedDate}
              exercises={exerciseMap}
              allData={data.exercises}
              swaps={data.swaps}
              onSaveWorkout={saveWorkout}
              onAddPerformance={addPerformance}
              onSwap={recordSwap}
              onChangeWorkout={() => setChoosingDate(selectedDate)}
            />
          )}
        </section>
      </div>

      <JournalTimeline sessions={data.workouts} onSelect={selectDate} />
      <RecentPerformance exercises={exercises} />
      <PersonalShelf exercises={exercises} />
    </div>
  );
}

function WorkoutChooser({ selectedDate, today, onChoose }: { selectedDate: string; today: string; onChoose: (day: WorkoutDay) => void }) {
  return (
    <div className="py-7">
      <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Plus className="size-4" /></span>
        <div><h3 className="font-semibold">{selectedDate > today ? "Plan a session" : "What are you training?"}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Choose the workout that fits this day. Your exercise checklist and set log will be created here.</p></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {journalChoices.map((day) => (
          <button key={day.slug} type="button" onClick={() => onChoose(day)} className="group flex min-h-32 items-start gap-4 rounded-2xl border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{day.type === "training" ? <Dumbbell className="size-4" /> : <Sparkles className="size-4" />}</span>
            <span className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-[.14em] text-foreground">{day.label}</span><strong className="mt-1 block text-lg">{day.title}</strong><span className="mt-1 block text-sm leading-5 text-muted-foreground">{day.emphasis} · {day.estimatedMinutes}</span></span>
            <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionTracker({ session, day, date, exercises, allData, swaps, onSaveWorkout, onAddPerformance, onSwap, onChangeWorkout }: {
  session: WorkoutRecord;
  day: WorkoutDay;
  date: string;
  exercises: Map<string, TrainingExercise>;
  allData: ReturnType<typeof useTrainingData>["data"]["exercises"];
  swaps: ReturnType<typeof useTrainingData>["data"]["swaps"];
  onSaveWorkout: ReturnType<typeof useTrainingData>["saveWorkout"];
  onAddPerformance: ReturnType<typeof useTrainingData>["addPerformance"];
  onSwap: ReturnType<typeof useTrainingData>["recordSwap"];
  onChangeWorkout: () => void;
}) {
  const total = totalItems(day);
  const percent = total ? Math.round((session.completedExercises.length / total) * 100) : 0;
  const [sessionNotes, setSessionNotes] = useState(session.notes ?? "");
  const [savedNote, setSavedNote] = useState(false);

  function persist(update: Partial<WorkoutRecord>) {
    const now = new Date().toISOString();
    const completedExercises = update.completedExercises ?? session.completedExercises;
    onSaveWorkout({ ...session, ...update, date, completedExercises, completedAt: completedExercises.length >= total && total > 0 ? session.completedAt ?? now : undefined, updatedAt: now });
  }

  function toggleItem(slug: string) {
    const next = session.completedExercises.includes(slug) ? session.completedExercises.filter((item) => item !== slug) : [...session.completedExercises, slug];
    persist({ completedExercises: next });
  }

  function saveExerciseLog(originalSlug: string, log: JournalExerciseLog) {
    const complete = log.sets.length > 0 && log.sets.every((set) => set.completed);
    const completedExercises = complete ? [...new Set([...session.completedExercises, originalSlug])] : session.completedExercises.filter((slug) => slug !== originalSlug);
    persist({ exerciseLogs: { ...(session.exerciseLogs ?? {}), [originalSlug]: log }, completedExercises });
    const performance: ExercisePerformance = { id: `${session.id}-${originalSlug}`, performedAt: performanceDate(date), weight: log.weight, sets: log.sets, notes: log.notes };
    onAddPerformance(log.exerciseSlug, performance);
  }

  function swapExercise(originalSlug: string, replacementSlug: string) {
    onSwap({ id: `${session.id}-${originalSlug}`, originalSlug, replacementSlug, daySlug: day.slug, swappedAt: new Date().toISOString() });
  }

  return (
    <div className="pt-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><p className="text-xs uppercase tracking-[.14em] text-muted-foreground">{day.emphasis}</p><h3 className="mt-1 text-2xl font-semibold">{day.title}</h3><div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground"><span>{day.estimatedMinutes}</span><span>{session.completedExercises.length}/{total} complete</span>{session.completedExercises.length === 0 && Object.keys(session.exerciseLogs ?? {}).length === 0 && <button type="button" onClick={onChangeWorkout} className="text-xs font-medium text-primary hover:underline">Change workout</button>}</div></div>
        <div className="min-w-32 rounded-2xl bg-secondary p-4 text-center"><strong className="font-mono text-2xl text-primary">{percent}%</strong><span className="mt-1 block text-[11px] uppercase tracking-wider text-muted-foreground">session progress</span></div>
      </div>
      <Progress className="mt-5" value={percent} aria-label={`${percent}% of session complete`} />
      <div className="mt-5"><RestTimer defaultSeconds={120} compact /></div>

      {day.type === "training" ? (
        <div className="mt-6 space-y-3">
          {day.exercises.map((item, index) => {
            const original = exercises.get(item.exerciseSlug);
            if (!original) return null;
            const swap = swaps.find((entry) => entry.id === `${session.id}-${item.exerciseSlug}`);
            const exercise = exercises.get(swap?.replacementSlug ?? item.exerciseSlug) ?? original;
            const options = [original.slug, ...original.alternatives].map((slug) => exercises.get(slug)).filter((entry): entry is TrainingExercise => Boolean(entry));
            return (
              <JournalExerciseCard
                key={`${session.id}-${item.exerciseSlug}-${index}`}
                item={item}
                original={original}
                exercise={exercise}
                options={options}
                done={session.completedExercises.includes(item.exerciseSlug)}
                log={session.exerciseLogs?.[item.exerciseSlug]}
                latest={allData[exercise.slug]?.history[0]}
                target={nextProgressionTarget(allData[exercise.slug], item.reps)}
                onToggle={() => toggleItem(item.exerciseSlug)}
                onSave={(log) => saveExerciseLog(item.exerciseSlug, log)}
                onSwap={(slug) => swapExercise(item.exerciseSlug, slug)}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-6 space-y-3">{day.recovery?.map((item, index) => { const id = `recovery-${index}`; const done = session.completedExercises.includes(id); return <label key={item} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border p-4 ${done ? "border-primary/30 bg-primary/[0.045]" : "border-border"}`}><Checkbox checked={done} onCheckedChange={() => toggleItem(id)} className="mt-0.5 size-6 rounded-lg" /><span className={done ? "text-muted-foreground line-through" : ""}>{item}</span></label>; })}</div>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-background/45 p-4 sm:p-5" aria-labelledby="reflection-heading">
        <div className="flex items-center gap-3"><NotebookPen className="size-4 text-primary" /><h4 id="reflection-heading" className="font-semibold">Session reflection</h4></div>
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">How did it feel?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([['rough', 'Tough'], ['steady', 'Solid'], ['strong', 'Strong']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={session.feeling === value} onClick={() => persist({ feeling: value })} className={`min-h-10 rounded-xl border px-2 text-sm font-medium ${session.feeling === value ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{label}</button>)}
        </div>
        <label className="mt-4 block text-sm font-medium">Notes for next time<Textarea value={sessionNotes} onChange={(event) => { setSessionNotes(event.target.value); setSavedNote(false); }} placeholder="Energy, pain-free range, machine settings, what to repeat…" className="mt-2 min-h-24 rounded-xl" maxLength={5000} /></label>
        <Button variant="outline" className="mt-3 rounded-xl" onClick={() => { persist({ notes: sessionNotes }); setSavedNote(true); }}>{savedNote ? <><CircleCheckBig /> Saved</> : "Save reflection"}</Button>
      </section>
    </div>
  );
}

function JournalExerciseCard({ item, original, exercise, options, done, log, latest, target, onToggle, onSave, onSwap }: {
  item: WorkoutExercise;
  original: TrainingExercise;
  exercise: TrainingExercise;
  options: TrainingExercise[];
  done: boolean;
  log?: JournalExerciseLog;
  latest?: ExercisePerformance;
  target: string;
  onToggle: () => void;
  onSave: (log: JournalExerciseLog) => void;
  onSwap: (slug: string) => void;
}) {
  const prescribed = Number(item.sets.match(/(\d+)\s*$/)?.[1] ?? item.sets.match(/\d+/)?.[0] ?? 3);
  const [open, setOpen] = useState(Boolean(log) && !done);
  const [weight, setWeight] = useState(log?.weight ?? latest?.weight ?? "");
  const [sets, setSets] = useState<LoggedSet[]>(log?.sets.length ? log.sets : Array.from({ length: prescribed }, () => ({ reps: null, rir: null, completed: false })));
  const [notes, setNotes] = useState(log?.notes ?? "");
  const [saved, setSaved] = useState(false);

  function updateSet(index: number, update: Partial<LoggedSet>) {
    setSaved(false);
    setSets((current) => current.map((set, setIndex) => setIndex === index ? { ...set, ...update } : set));
  }

  function save() {
    const normalized = sets.map((set) => ({ ...set, completed: set.completed || set.reps !== null }));
    setSets(normalized);
    onSave({ exerciseSlug: exercise.slug, weight: weight.trim(), sets: normalized, notes: notes.trim() || undefined, updatedAt: new Date().toISOString() });
    setSaved(true);
  }

  return (
    <article className={`overflow-hidden rounded-2xl border transition-colors ${done ? "border-primary/30 bg-primary/[0.04]" : "border-border bg-background/40"}`}>
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <Checkbox checked={done} onCheckedChange={onToggle} aria-label={`Mark ${exercise.name} complete`} className="mt-1 size-6 rounded-lg" />
        <div className="min-w-0 flex-1">
          {exercise.slug !== original.slug && <p className="mb-1 text-xs text-primary">Swapped from {original.name}</p>}
          <Link href={`/exercises/${exercise.slug}`} className={`font-semibold hover:text-primary ${done ? "text-muted-foreground line-through" : ""}`}>{exercise.name}</Link>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Repeat2 className="size-3" />{item.sets} × {item.reps}</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{item.rest}</span></div>
          <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-primary"><Target className="mt-0.5 size-3 shrink-0" />{target}</p>
          {item.note && <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.note}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={open ? "secondary" : "outline"} size="sm" className="h-9 rounded-lg" onClick={() => setOpen((current) => !current)}>{open ? "Close set log" : log ? "Edit set log" : "Log sets"}</Button>
            {options.length > 1 && <label className="relative flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><Shuffle className="size-3.5" /><span>Swap</span><select className="absolute inset-0 cursor-pointer opacity-0" value={exercise.slug} onChange={(event) => onSwap(event.target.value)} aria-label={`Swap ${original.name}`}>{options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}</select></label>}
            <Button variant="ghost" size="sm" className="h-9 rounded-lg" render={<Link href={`/exercises/${exercise.slug}`} />}>Form guide <ArrowRight className="size-3" /></Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card p-4 sm:p-5">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Working weight or resistance<Input value={weight} onChange={(event) => { setWeight(event.target.value); setSaved(false); }} placeholder="e.g. 50 kg, pin 7, bodyweight" className="mt-2 h-11 rounded-xl" maxLength={100} /></label>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-[2.4rem_1fr_1fr_2.2rem] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"><span>Set</span><span>Reps</span><span>RIR</span><span>Done</span></div>
            {sets.map((set, index) => (
              <div key={index} className="grid grid-cols-[2.4rem_1fr_1fr_2.2rem] items-center gap-2 rounded-xl bg-secondary/55 p-2">
                <span className="text-center font-mono text-sm">{index + 1}</span>
                <Input type="number" inputMode="numeric" min={0} max={100} value={set.reps ?? ""} onChange={(event) => updateSet(index, { reps: event.target.value === "" ? null : Number(event.target.value) })} aria-label={`${exercise.name} set ${index + 1} repetitions`} className="h-10 rounded-lg" placeholder="—" />
                <Input type="number" inputMode="numeric" min={0} max={10} value={set.rir ?? ""} onChange={(event) => updateSet(index, { rir: event.target.value === "" ? null : Number(event.target.value) })} aria-label={`${exercise.name} set ${index + 1} reps in reserve`} className="h-10 rounded-lg" placeholder="1–3" />
                <Checkbox checked={set.completed} onCheckedChange={(checked) => updateSet(index, { completed: Boolean(checked) })} aria-label={`Complete ${exercise.name} set ${index + 1}`} className="mx-auto size-6 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><Button variant="ghost" size="xs" onClick={() => sets.length < 10 && setSets((current) => [...current, { reps: null, rir: null, completed: false }])}><Plus /> Add set</Button>{sets.length > 1 && <Button variant="ghost" size="xs" onClick={() => setSets((current) => current.slice(0, -1))}>Remove last</Button>}</div>
          <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Exercise note<Textarea value={notes} onChange={(event) => { setNotes(event.target.value); setSaved(false); }} placeholder="Seat, grip, tempo, pain-free range…" className="mt-2 min-h-20 rounded-xl" maxLength={2000} /></label>
          <Button className="mt-4 h-11 w-full rounded-xl" onClick={save}>{saved ? <><CircleCheckBig /> Set log saved</> : "Save set log"}</Button>
        </div>
      )}
    </article>
  );
}

function JournalTimeline({ sessions, onSelect }: { sessions: WorkoutRecord[]; onSelect: (date: string) => void }) {
  const recent = [...sessions].sort((a, b) => workoutDate(b).localeCompare(workoutDate(a)) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 10);
  return (
    <section aria-labelledby="journal-history-heading">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><History className="size-4" /></span><div><p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Log book</p><h2 id="journal-history-heading" className="text-2xl font-semibold">Recent sessions</h2></div></div>
      {recent.length ? <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recent.map((session) => { const day = workoutDays.find((item) => item.slug === session.daySlug); const date = workoutDate(session); const total = day ? totalItems(day) : 0; const status = sessionStatus(session, total); return <li key={session.id}><button type="button" onClick={() => onSelect(date)} className="flex min-h-28 w-full items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${status === "complete" ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>{status === "complete" ? <CircleCheckBig className="size-4" /> : <CalendarCheck className="size-4" />}</span><span className="min-w-0 flex-1"><strong className="block">{day?.title ?? "Workout"}</strong><time dateTime={date} className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(dateFromKey(date))}</time><span className="mt-2 block font-mono text-xs text-primary">{session.completedExercises.length}/{total} complete</span></span><ArrowRight className="mt-1 size-4 text-muted-foreground" /></button></li>; })}</ol> : <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">Choose a date and workout above. Every session will become a dated logbook entry here.</div>}
    </section>
  );
}

function RecentPerformance({ exercises }: { exercises: TrainingExercise[] }) {
  const { data } = useTrainingData();
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.slug, exercise]));
  const entries = Object.entries(data.exercises)
    .flatMap(([slug, record]) => record.history.map((performance) => ({ slug, performance })))
    .sort((a, b) => Date.parse(b.performance.performedAt) - Date.parse(a.performance.performedAt))
    .slice(0, 8);

  if (!entries.length) return null;

  return (
    <section aria-labelledby="recent-lifts-heading">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Dumbbell className="size-4" /></span>
        <div><p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Exercise history</p><h2 id="recent-lifts-heading" className="text-2xl font-semibold">Recent lifts</h2></div>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map(({ slug, performance }) => {
          const exercise = exerciseMap.get(slug);
          const reps = performance.sets.filter((set) => set.completed && set.reps !== null).map((set) => set.reps).join(", ");
          return (
            <li key={`${slug}-${performance.id}`}>
              <Link href={`/exercises/${slug}`} className="group block min-h-32 rounded-2xl border border-border bg-card p-4 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <strong className="block truncate">{exercise?.name ?? slug}</strong>
                <p className="mt-2 font-mono text-sm text-primary">{performance.weight || "Bodyweight"} · {reps || "—"} reps</p>
                <time dateTime={performance.performedAt} className="mt-3 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(performance.performedAt))}</time>
                <span className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">Open exercise <ArrowRight className="size-3" /></span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function PersonalShelf({ exercises }: { exercises: TrainingExercise[] }) {
  const { data } = useTrainingData();
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.slug, exercise]));
  const favorites = Object.entries(data.exercises).filter(([, record]) => record.favorite).map(([slug]) => exerciseMap.get(slug)).filter((item): item is TrainingExercise => Boolean(item));
  const recent = data.recent.map((slug) => exerciseMap.get(slug)).filter((item): item is TrainingExercise => Boolean(item));
  return <div className="grid gap-10 lg:grid-cols-2"><ExerciseRow title="Favorites" icon={Heart} items={favorites} empty="Tap the heart on any exercise page to keep your best options here." /><ExerciseRow title="Recently viewed" icon={Clock3} items={recent} empty="Exercises you open will appear here for quick access." /></div>;
}

function ExerciseRow({ title, icon: Icon, items, empty }: { title: string; icon: typeof Heart; items: TrainingExercise[]; empty: string }) {
  return <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></span><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-2xl font-semibold">{title}</h2></div>{items.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{items.slice(0, 6).map((item) => <Link key={item.slug} href={`/exercises/${item.slug}`} className="group flex min-h-24 items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card pr-4 hover:border-primary/40"><span className="relative h-24 w-24 shrink-0 bg-muted"><Image src={item.image} alt="" fill sizes="96px" className="object-cover" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.muscleGroup}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></Link>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">{empty}</div>}</section>;
}
