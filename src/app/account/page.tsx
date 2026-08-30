import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = {
  title: "Account & record backup",
  description: "Optionally sync, export, or restore your private workout records.",
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your records</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Account & backup</h1>
      <p className="mb-8 mt-4 max-w-2xl leading-7 text-muted-foreground">Use the site privately on one device, or create an optional account to keep training history available across devices.</p>
      <AccountPanel />
    </main>
  );
}
