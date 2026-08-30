"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, BookOpen, CalendarDays, Library } from "lucide-react";

import { WorkoutSession, type WorkoutExerciseSummary } from "@/components/workout-session";
import { Button } from "@/components/ui/button";
import type { WorkoutDay } from "@/data/workouts";

export function TodayDashboard({ days, exerciseMap, serverDayNumber, serverDateLabel }: { days: WorkoutDay[]; exerciseMap: Record<string, WorkoutExerciseSummary>; serverDayNumber: number; serverDateLabel: string }) {
  const dayNumber = useSyncExternalStore(noopSubscribe, getLocalDayNumber, () => serverDayNumber);
  const dateLabel = useSyncExternalStore(noopSubscribe, getLocalDateLabel, () => serverDateLabel);

  const day = days.find((item) => item.day === dayNumber) ?? days[0];
  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Today · {day.label}</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{day.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{dateLabel || "Your local training day"} · {day.emphasis}</p>
            </div>
            <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:block">Target: 1–3 RIR</span>
          </div>
          <WorkoutSession day={day} exerciseMap={exerciseMap} compact />
        </div>

        <aside className="space-y-4 lg:pt-20">
          <QuickLink href={`/workout/${day.slug}`} icon={CalendarDays} title="Full day overview" detail="Warm-up, order, targets and notes" />
          <QuickLink href="/exercises" icon={Library} title="Exercise library" detail="112 movements with gym-ready swaps" />
          <QuickLink href="/progression" icon={ArrowRight} title="What should I beat?" detail="Use the double-progression rule" />
          <div className="rounded-3xl border border-border bg-card p-5">
            <BookOpen className="size-5 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">The rule for today</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Keep 1–3 good reps in reserve. Add load only after you reach the top of the rep range across every set with stable technique.</p>
            <Button variant="outline" className="mt-4 h-10 w-full rounded-xl" render={<Link href="/progression" />}>See progression example <ArrowRight className="size-4" /></Button>
          </div>
        </aside>
      </div>
    </main>
  );
}

function noopSubscribe() {
  return () => undefined;
}

function getLocalDayNumber() {
  const day = new Date().getDay();
  return day === 0 ? 7 : day;
}

function getLocalDateLabel() {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

function QuickLink({ href, icon: Icon, title, detail }: { href: string; icon: typeof Library; title: string; detail: string }) {
  return (
    <Link href={href} className="group flex min-h-20 items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" /></span>
      <span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="text-xs leading-5 text-muted-foreground">{detail}</span></span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
