import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Gauge, Repeat2, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Double Progression",
  description: "A practical guide to adding reps and weight while keeping technique and effort consistent.",
};

const weeks = [
  { week: "Week 1", sets: "10, 9, 8", note: "Establish the load" },
  { week: "Week 2", sets: "11, 10, 9", note: "Add clean reps" },
  { week: "Week 3", sets: "12, 12, 11", note: "Nearly at the top" },
  { week: "Week 4", sets: "12, 12, 12", note: "Range completed" },
];

export default function ProgressionPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Progressive overload</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Add reps first. Add weight second.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Double progression gives every set a clear target without forcing weight increases before your technique is ready.</p>
      </div>

      <section className="mt-9 overflow-hidden rounded-3xl border border-border bg-card" aria-labelledby="example-heading">
        <div className="border-b border-border p-5 sm:p-7">
          <p className="text-sm text-muted-foreground">Example rep range</p>
          <h2 id="example-heading" className="mt-1 font-mono text-3xl font-semibold">3 × 8–12</h2>
        </div>
        <div className="divide-y divide-border">
          {weeks.map((row, index) => (
            <div key={row.week} className={`grid grid-cols-[80px_1fr] items-center gap-4 p-5 sm:grid-cols-[110px_1fr_180px] sm:px-7 ${index === weeks.length - 1 ? "bg-primary/[0.06]" : ""}`}>
              <strong className="text-sm">{row.week}</strong>
              <span className="font-mono text-lg font-semibold tracking-wide">{row.sets}</span>
              <span className="col-start-2 text-sm text-muted-foreground sm:col-start-auto">{row.note}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Principle icon={Repeat2} number="01" title="Own the range" text="Keep the same load while adding one or more clean reps across the sets." />
        <Principle icon={Gauge} number="02" title="Respect effort" text="Stay around 1–3 RIR. A forced rep with changed technique does not count as progress." />
        <Principle icon={Scale} number="03" title="Add a small load" text="Once every set reaches the top of the range, increase weight slightly and build again." />
      </div>

      <section className="mt-8 rounded-3xl border border-primary/30 bg-primary/[0.055] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="mt-1 size-6 shrink-0 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">What to do after Week 4</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Increase the load by the smallest practical jump. Your reps may fall back toward the bottom of the range—perhaps 9, 8, 8. Keep the same weight and work upward again. If the next load jump is large, first aim to perform the old load with slower control or an extra rep buffer.</p>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="readiness-heading">
        <h2 id="readiness-heading" className="text-2xl font-semibold">Increase weight only when all are true</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {["Every working set reached the top of the range", "Rep speed and range stayed consistent", "You still had roughly 1–2 good reps available", "No new joint pain or compensation appeared"].map((item) => (
            <li key={item} className="flex gap-3 rounded-2xl border border-border bg-card p-4"><ArrowRight className="mt-0.5 size-5 shrink-0 text-primary" /><span>{item}</span></li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Principle({ icon: Icon, number, title, text }: { icon: typeof Repeat2; number: string; title: string; text: string }) {
  return (
    <article className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-secondary"><Icon className="size-5 text-primary" /></span><span className="font-mono text-xs text-muted-foreground">{number}</span></div>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}
