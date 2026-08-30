import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Database, LockKeyhole, Smartphone } from "lucide-react";

export const metadata: Metadata = { title: "About", description: "Why Form / Function exists and how its local-first workout tools work." };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About the project</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">A workout reference designed for the space between sets.</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">Form / Function combines a practical weekly program with a searchable exercise encyclopedia, fast equipment swaps, and just enough local tracking to answer “what should I do next?” without an account or a complicated backend.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <Value icon={Smartphone} title="Mobile first" text="Large touch targets, high contrast, concise workout cards, and fast links to form guides." />
        <Value icon={Database} title="Structured content" text="Every exercise has a stable URL and typed data that can grow without rebuilding the interface." />
        <Value icon={LockKeyhole} title="Local by default" text="Favorites, notes, last loads, and completed exercises stay in this browser's local storage." />
      </div>
      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">What this is—and is not</h2>
        <p className="mt-3 leading-7 text-muted-foreground">This is an educational personal training reference, not individualized medical care. Exercises should be adapted to your equipment, history, and pain-free range. Persistent pain or other concerning symptoms deserve assessment by a qualified professional.</p>
        <Link href="/sources" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">Review sources and licenses <ArrowRight className="size-4" /></Link>
      </section>
    </main>
  );
}

function Value({ icon: Icon, title, text }: { icon: typeof Smartphone; title: string; text: string }) {
  return <article className="rounded-3xl border border-border bg-card p-5"><span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>;
}
