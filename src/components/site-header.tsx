import Link from "next/link";
import { Dumbbell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountButton } from "@/components/account-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Dumbbell className="size-5" aria-hidden="true" />
          </span>
          <span>Form / Function</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label="Primary navigation">
          <Link className="transition-colors hover:text-foreground" href="/">Today</Link>
          <Link className="transition-colors hover:text-foreground" href="/workout">Program</Link>
          <Link className="transition-colors hover:text-foreground" href="/exercises">Exercises</Link>
          <Link className="transition-colors hover:text-foreground" href="/my-training">My training</Link>
          <Link className="transition-colors hover:text-foreground" href="/progression">Progression</Link>
          <Link className="transition-colors hover:text-foreground" href="/guides">Guides</Link>
        </nav>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="hidden h-9 rounded-xl lg:inline-flex" render={<Link href="/exercises" />}>
            <Search className="size-4" /> Find exercise
          </Button>
          <ThemeToggle />
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
