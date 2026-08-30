"use client";

import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Cloud, Download, LogOut, ShieldCheck, Upload } from "lucide-react";

import { useTrainingData } from "@/components/training-data-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";
import { normalizeTrainingData } from "@/lib/training-data";

export function AccountPanel() {
  const { data: session, isPending } = useSession();
  const { data, replaceData, syncState } = useTrainingData();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      if (mode === "signup") {
        const result = await signUp.email({
          email: String(form.get("email") ?? "").trim(),
          password,
          name: String(form.get("name") ?? "").trim(),
          username: String(form.get("username") ?? "").trim(),
        });
        if (result.error) throw new Error(result.error.message ?? "Unable to create account");
        setMessage("Account created. Your records are being merged and synced.");
      } else {
        const result = identifier.includes("@")
          ? await signIn.email({ email: identifier, password, rememberMe: true })
          : await signIn.username({ username: identifier, password, rememberMe: true });
        if (result.error) throw new Error(result.error.message ?? "Unable to sign in");
        setMessage("Signed in. Your device records are being merged with your account.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function exportRecords() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `form-function-records-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded.");
  }

  async function importRecords(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error("That backup is larger than the 1 MB safety limit.");
      replaceData(normalizeTrainingData(JSON.parse(await file.text())));
      setMessage("Backup imported and saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "That file is not a valid backup.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (isPending) return <div className="h-80 animate-pulse rounded-3xl bg-muted" />;

  if (session?.user) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><CheckCircle2 className="size-5" /></span>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Signed in</p>
          <h2 className="mt-2 text-2xl font-semibold">{session.user.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{session.user.email}</p>
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-secondary/70 p-4 text-sm">
            <Cloud className="size-4 text-primary" />
            {syncState === "synced" ? "Records are synced to your account." : syncState === "syncing" ? "Syncing your latest records…" : syncState === "error" ? "Cloud sync is unavailable; changes remain safe on this device." : "Records are stored on this device."}
          </div>
          <Button variant="outline" className="mt-6 h-11 rounded-xl" onClick={() => void signOut()}><LogOut className="size-4" /> Sign out</Button>
        </section>
        <DataTools onExport={exportRecords} onImport={importRecords} fileRef={fileRef} />
        {message && <p className="lg:col-span-2 rounded-xl bg-secondary px-4 py-3 text-sm" role="status">{message}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex rounded-xl bg-secondary p-1" role="tablist" aria-label="Account action">
          {(["signin", "signup"] as const).map((value) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-medium ${mode === value ? "bg-background shadow-sm" : "text-muted-foreground"}`} onClick={() => { setMode(value); setMessage(null); }}>
              {value === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "signup" ? (
            <>
              <Field label="Display name" name="name" autoComplete="name" placeholder="Your name" />
              <Field label="Username" name="username" autoComplete="username" placeholder="gymname" minLength={3} pattern="[A-Za-z0-9._-]+" />
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
            </>
          ) : <Field label="Email or username" name="identifier" autoComplete="username" placeholder="you@example.com or gymname" />}
          <Field label="Password" name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={10} placeholder="At least 10 characters" />
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</Button>
        </form>
        {message && <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm" role="status">{message}</p>}
        <div className="mt-6 flex gap-3 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /><p>An account is optional. Without one, records stay in this browser. Signing in merges those records into your private account data.</p></div>
      </section>
      <DataTools onExport={exportRecords} onImport={importRecords} fileRef={fileRef} />
    </div>
  );
}

function Field(props: React.ComponentProps<"input"> & { label: string }) {
  const { label, ...inputProps } = props;
  return <label className="block text-sm font-medium">{label}<Input {...inputProps} required className="mt-2 h-11 rounded-xl" /></label>;
}

function DataTools({ onExport, onImport, fileRef }: { onExport: () => void; onImport: (file: File | undefined) => void; fileRef: React.RefObject<HTMLInputElement | null> }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Data portability</p>
      <h2 className="mt-2 text-xl font-semibold">Backup your records</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Download everything as JSON, or restore a previous Form / Function backup. Importing replaces the current record set.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Button variant="outline" className="h-11 rounded-xl" onClick={onExport}><Download className="size-4" /> Export backup</Button>
        <Button variant="outline" className="h-11 rounded-xl" onClick={() => fileRef.current?.click()}><Upload className="size-4" /> Import backup</Button>
        <input ref={fileRef} className="sr-only" type="file" accept="application/json,.json" aria-label="Import workout backup" onChange={(event) => void onImport(event.target.files?.[0])} />
      </div>
    </section>
  );
}
