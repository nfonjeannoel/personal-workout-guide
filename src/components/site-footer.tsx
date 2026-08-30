import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pb-28 pt-10 text-sm text-muted-foreground md:pb-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>Form / Function · A practical personal training reference.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer navigation">
          <Link className="hover:text-foreground" href="/about">About</Link>
          <Link className="hover:text-foreground" href="/sources">Sources</Link>
          <Link className="hover:text-foreground" href="/guides">Training guides</Link>
          <Link className="hover:text-foreground" href="/account">Account & backup</Link>
          <a className="hover:text-foreground" href="https://github.com/nfonjeannoel/personal-workout-guide" rel="noreferrer" target="_blank">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
