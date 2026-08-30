import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Gauge, Repeat2, ShieldAlert, Wind } from "lucide-react";

import { ExerciseImagePair } from "@/components/exercise-image-pair";
import { ExerciseTracker } from "@/components/exercise-tracker";
import { RestTimer } from "@/components/rest-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exercises, getAlternatives, getExercise } from "@/data/exercises";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const exercise = getExercise((await params).slug);
  if (!exercise) return { title: "Exercise not found" };
  const title = `${exercise.name}: Proper Form, Muscles Worked & Alternatives`;
  const description = `Learn proper ${exercise.name.toLowerCase()} technique, setup, muscles worked, common mistakes, recommended reps, and alternative exercises.`;
  const image = new URL(exercise.images[0].src, siteUrl).toString();
  return {
    title,
    description,
    alternates: { canonical: `/exercises/${exercise.slug}` },
    openGraph: { title, description, type: "article", images: [{ url: image, alt: exercise.images[0].alt }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ExercisePage({ params }: Props) {
  const exercise = getExercise((await params).slug);
  if (!exercise) notFound();
  const alternatives = getAlternatives(exercise);
  const groupedAlternatives = alternatives.reduce((groups, item) => {
    const group = groups.get(item.equipment) ?? [];
    group.push(item);
    groups.set(item.equipment, group);
    return groups;
  }, new Map<string, typeof alternatives>());

  return (
    <main>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-5 rounded-lg" render={<Link href="/exercises" />}>
          <ArrowLeft className="size-4" /> Exercise library
        </Button>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,.75fr)]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge>{exercise.muscleGroup}</Badge>
              <Badge variant="secondary">{exercise.equipment}</Badge>
              <Badge variant="outline">{exercise.movementPattern}</Badge>
              <Badge variant="outline">{exercise.difficulty}</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{exercise.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{exercise.description}</p>

            <div className="mt-7">
              <ExerciseImagePair exercise={exercise} priority />
            </div>

            <div className="mt-8 grid gap-6">
              <GuideSection title="Set up" items={exercise.setup} numberStyle />
              <GuideSection title="How to perform it" items={exercise.instructions} numberStyle />

              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" aria-labelledby="breathing-heading">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Wind className="size-5" /></span>
                  <div>
                    <h2 id="breathing-heading" className="text-xl font-semibold">Breathing</h2>
                    <p className="mt-2 leading-7 text-muted-foreground">{exercise.breathing}</p>
                  </div>
                </div>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <GuideSection title="Technique cues" items={exercise.formCues} />
                <GuideSection title="Common mistakes" items={exercise.commonMistakes} warning />
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" aria-label="Training prescription">
            <section className="rounded-3xl border border-primary/30 bg-primary/[0.055] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Working prescription</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric icon={Repeat2} label="Sets" value={exercise.recommendedSets.replace(" working sets", "")} />
                <Metric icon={Gauge} label="Reps" value={exercise.recommendedRepRange.replace(" reps", "")} />
                <Metric icon={Clock3} label="Rest" value={`${exercise.restSeconds[0] / 60}–${exercise.restSeconds[1] / 60} min`} />
                <Metric icon={Gauge} label="Effort" value="1–3 RIR" />
              </div>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{exercise.rir}. Stop earlier if technique changes or a joint feels irritated.</p>
            </section>
            <RestTimer defaultSeconds={exercise.restSeconds[0]} />
            <ExerciseTracker slug={exercise.slug} name={exercise.name} />
          </aside>
        </div>
      </div>

      <section className="mt-8 border-y border-border bg-card/50 py-12 sm:py-16" aria-labelledby="alternatives-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Machine busy?</p>
          <h2 id="alternatives-heading" className="mt-3 text-3xl font-semibold tracking-tight">See equivalent alternatives</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">These options train the same main muscle group and prioritize a similar movement pattern. Match the effort and rep target rather than trying to match the exact load.</p>
          <div className="mt-8 space-y-8">
            {[...groupedAlternatives.entries()].map(([equipment, items]) => (
              <div key={equipment}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{equipment}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <Link key={item.slug} href={`/exercises/${item.slug}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
                      <div className="relative aspect-[16/9] bg-muted">
                        <Image src={item.images[0].src} alt={item.images[0].alt} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
                      </div>
                      <div className="flex items-center gap-3 p-4">
                        <span className="flex-1 font-semibold">{item.name}</span>
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-8 text-xs leading-5 text-muted-foreground sm:px-6">
        <p><strong className="text-foreground">Safety note:</strong> This training reference is educational, not medical advice. Use pain-free ranges and seek qualified care for persistent pain, dizziness, or other concerning symptoms.</p>
      </div>
    </main>
  );
}

function GuideSection({ title, items, warning = false, numberStyle = false }: { title: string; items: string[]; warning?: boolean; numberStyle?: boolean }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        {warning && <span className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><ShieldAlert className="size-5" /></span>}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <ol className="mt-5 space-y-4">
        {items.map((item, index) => (
          <li key={item} className="flex gap-3 leading-7 text-muted-foreground">
            <span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${warning ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"}`}>
              {numberStyle ? index + 1 : "•"}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <Icon className="size-4 text-primary" aria-hidden="true" />
      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold">{value}</p>
    </div>
  );
}
