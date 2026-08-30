import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, ImageIcon, PencilLine } from "lucide-react";

import attribution from "@/data/image-attribution.json";

export const metadata: Metadata = {
  title: "Sources & Attribution",
  description: "Exercise image, dataset, license, and editorial attribution for Form / Function.",
};

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sources & attribution</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Open imagery, visible provenance.</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">The exercise imagery is stored locally for speed and reliability. Every imported image remains traceable to its upstream exercise record.</p>
      </div>

      <div className="mt-9 grid gap-5 md:grid-cols-3">
        <SourceCard icon={ImageIcon} title={`${attribution.length * 2} local images`} text="Two start/finish images are included for each exercise page." />
        <SourceCard icon={FileCheck2} title="Unlicense" text="The upstream repository publishes its contents under a public-domain dedication." />
        <SourceCard icon={PencilLine} title="Original coaching layer" text="Setup notes, cues, mistakes, prescriptions, and alternatives were structured and edited for this site." />
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8" aria-labelledby="upstream-heading">
        <h2 id="upstream-heading" className="text-2xl font-semibold">Free Exercise DB</h2>
        <p className="mt-3 leading-7 text-muted-foreground">Exercise start/finish images are derived from the open Free Exercise DB project maintained by yuhonas. The repository describes itself as an open public-domain exercise dataset and provides a root Unlicense file. A copy of that license is preserved in this repository under <code className="rounded bg-secondary px-1.5 py-0.5 text-sm text-foreground">THIRD_PARTY_LICENSES</code>.</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-primary">
          <a className="inline-flex items-center gap-1" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">Upstream repository <ArrowUpRight className="size-4" /></a>
          <a className="inline-flex items-center gap-1" href="https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md" target="_blank" rel="noreferrer">License text <ArrowUpRight className="size-4" /></a>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="manifest-heading">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Image manifest</p><h2 id="manifest-heading" className="mt-2 text-2xl font-semibold">Exercise-by-exercise mapping</h2></div>
          <span className="font-mono text-xs text-muted-foreground">{attribution.length} records</span>
        </div>
        <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="max-h-[680px] overflow-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-secondary text-xs uppercase tracking-[0.12em] text-muted-foreground">
                <tr><th className="px-4 py-3 font-medium">Site exercise</th><th className="hidden px-4 py-3 font-medium sm:table-cell">Upstream record</th><th className="hidden px-4 py-3 font-medium md:table-cell">Mapping</th><th className="px-4 py-3 font-medium">License</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attribution.map((item) => (
                  <tr key={item.slug}>
                    <td className="px-4 py-3"><Link className="font-medium hover:text-primary" href={`/exercises/${item.slug}`}>{item.exerciseName}</Link></td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell"><a className="hover:text-primary" href={item.sourceUrl} target="_blank" rel="noreferrer">{item.upstreamName}</a></td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{item.mappingType}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p className="mt-8 text-sm leading-6 text-muted-foreground">Exercise technique is sensitive to individual anatomy, equipment design, and medical history. This site provides general educational guidance, not medical diagnosis or individualized treatment.</p>
    </main>
  );
}

function SourceCard({ icon: Icon, title, text }: { icon: typeof ImageIcon; title: string; text: string }) {
  return <article className="rounded-3xl border border-border bg-card p-5"><span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></span><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>;
}
