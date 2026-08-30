"use client";

import Link from "next/link";
import { Cloud, CloudOff, LogIn, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTrainingData } from "@/components/training-data-provider";
import { useSession } from "@/lib/auth-client";

export function AccountButton() {
  const { data: session, isPending } = useSession();
  const { syncState } = useTrainingData();

  if (isPending) return <span className="h-9 w-9 animate-pulse rounded-xl bg-muted sm:w-24" role="status"><span className="sr-only">Loading account</span></span>;
  if (!session?.user) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl sm:w-24" aria-label="Sign in to account" render={<Link href="/account" />}>
        <LogIn className="size-4" /> <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  const SyncIcon = syncState === "error" ? CloudOff : Cloud;
  return (
    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl sm:w-24" aria-label={`Open account for ${session.user.name}`} render={<Link href="/account" />}>
      <UserRound className="size-4" />
      <span className="hidden max-w-28 truncate sm:inline">{session.user.name}</span>
      <SyncIcon className={`size-3.5 ${syncState === "synced" ? "text-primary" : "text-muted-foreground"}`} aria-label={syncState === "synced" ? "Records synced" : "Sync status"} />
    </Button>
  );
}
