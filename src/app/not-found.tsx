import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-4 py-16 text-center">
      <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary text-primary"><Dumbbell className="size-6" /></span><p className="mt-6 font-mono text-sm text-primary">404</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">That movement is not in the plan.</h1><p className="mt-4 leading-7 text-muted-foreground">The page may have moved, or the exercise slug is not part of the current library.</p><Button className="mt-7 h-11 rounded-xl" render={<Link href="/exercises" />}><ArrowLeft className="size-4" /> Return to exercise library</Button></div>
    </main>
  );
}
