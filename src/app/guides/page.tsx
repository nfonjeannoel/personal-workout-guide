import type { Metadata } from "next";
import { Activity, Clock3, Gauge, ShieldCheck, Waves } from "lucide-react";

export const metadata: Metadata = {
  title: "Training Guides",
  description: "Practical guidance for warming up, choosing effort, resting between sets, and training with controlled technique.",
};

const guides = [
  { icon: Activity, title: "Warm up without tiring yourself", text: "Begin with 3–8 minutes of easy movement if useful. Before the first major lift, perform 2–4 progressively heavier practice sets. Keep warm-up reps well short of failure; their job is to rehearse the movement and prepare the joints, not create fatigue." },
  { icon: Gauge, title: "Use RIR to choose effort", text: "RIR means reps in reserve: the number of technically sound repetitions you could still perform. Most working sets in this plan should finish around 1–3 RIR. Isolation movements can occasionally move closer to failure when the setup is stable and pain-free." },
  { icon: Clock3, title: "Rest long enough to repeat quality", text: "Take roughly 2–3 minutes after compound lifts and 60–120 seconds after isolation work. Longer rest is appropriate if breathing, grip, or local fatigue would meaningfully reduce the next set. The timer is a guide, not a command to rush." },
  { icon: Waves, title: "Control every repetition", text: "Lower the load deliberately, reverse direction without bouncing, and accelerate through the effort while keeping the intended positions. A consistent range and tempo make progression easier to judge and keep the target muscle—not momentum—doing the work." },
  { icon: ShieldCheck, title: "Know when to stop", text: "Muscle effort and a controlled stretch are expected; sharp pain, sudden weakness, dizziness, or altered sensation are not. Stop the set, reduce range or load, and seek qualified medical care for concerning or persistent symptoms." },
];

export default function GuidesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Training guides</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Make every working set useful.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Simple decisions for effort, rest, warm-ups, and technique—written to be checked quickly between sets.</p>
      </div>
      <div className="mt-9 space-y-4">
        {guides.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className="grid gap-4 rounded-3xl border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-primary"><Icon className="size-5" /></span>
            <div><p className="font-mono text-xs text-muted-foreground">GUIDE {String(index + 1).padStart(2, "0")}</p><h2 className="mt-1 text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></div>
          </article>
        ))}
      </div>
    </main>
  );
}
