"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Heart, History, Repeat2 } from "lucide-react";

import { useTrainingData } from "@/components/training-data-provider";

interface TrainingExercise {
  slug: string;
  name: string;
  muscleGroup: string;
  image: string;
}

export function MyTrainingDashboard({ exercises }: { exercises: TrainingExercise[] }) {
  const { data, hydrated } = useTrainingData();
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.slug, exercise]));
  const favorites = Object.entries(data.exercises).filter(([, record]) => record.favorite).map(([slug]) => exerciseMap.get(slug)).filter((item): item is TrainingExercise => Boolean(item));
  const recent = data.recent.map((slug) => exerciseMap.get(slug)).filter((item): item is TrainingExercise => Boolean(item));
  const sessions = Object.entries(data.exercises).flatMap(([slug, record]) => record.history.map((session) => ({ ...session, exercise: exerciseMap.get(slug) }))).filter((item) => item.exercise).sort((a, b) => Date.parse(b.performedAt) - Date.parse(a.performedAt)).slice(0, 12);

  if (!hydrated) return <div className="grid gap-4 sm:grid-cols-2"><div className="h-52 animate-pulse rounded-3xl bg-muted" /><div className="h-52 animate-pulse rounded-3xl bg-muted" /></div>;
  return (
    <div className="space-y-10">
      <ExerciseRow title="Favorites" icon={Heart} items={favorites} empty="Tap the heart on any exercise page to keep your best options here." />
      <ExerciseRow title="Recently viewed" icon={Clock3} items={recent} empty="Exercises you open will appear here for quick access." />
      <section aria-labelledby="history-heading">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><History className="size-4" /></span><div><p className="text-xs uppercase tracking-[.14em] text-muted-foreground">Personal records</p><h2 id="history-heading" className="text-2xl font-semibold">Recent working sets</h2></div></div>
        {sessions.length ? <ol className="mt-5 grid gap-3 md:grid-cols-2">{sessions.map((session) => <li key={session.id}><Link href={`/exercises/${session.exercise?.slug}`} className="flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary/40"><span className="min-w-0 flex-1"><strong className="block truncate">{session.exercise?.name}</strong><time dateTime={session.performedAt} className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(session.performedAt))}</time><span className="mt-2 flex items-center gap-1.5 font-mono text-xs text-primary"><Repeat2 className="size-3" />{session.weight || "Bodyweight"} · {session.sets.filter((set) => set.completed).map((set) => set.reps ?? "–").join(", ")} reps</span></span><ArrowRight className="size-4 text-muted-foreground" /></Link></li>)}</ol> : <EmptyState text="Your saved working sets will build a history here." />}
      </section>
    </div>
  );
}

function ExerciseRow({ title, icon: Icon, items, empty }: { title: string; icon: typeof Heart; items: TrainingExercise[]; empty: string }) {
  return <section aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-heading`}><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-4" /></span><h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-heading`} className="text-2xl font-semibold">{title}</h2></div>{items.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <Link key={item.slug} href={`/exercises/${item.slug}`} className="group flex min-h-24 items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card pr-4 hover:border-primary/40"><span className="relative h-24 w-24 shrink-0 bg-muted"><Image src={item.image} alt="" fill sizes="96px" className="object-cover" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{item.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{item.muscleGroup}</span></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></Link>)}</div> : <EmptyState text={empty} />}</section>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="mt-5 rounded-2xl border border-dashed border-border p-6 text-sm leading-6 text-muted-foreground">{text}</div>;
}
