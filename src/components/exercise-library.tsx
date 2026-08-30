"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Equipment, MovementPattern, MuscleGroup } from "@/data/exercises";

export interface ExerciseListItem {
  slug: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: string;
  repRange: string;
  image: string;
}

interface ExerciseLibraryProps {
  items: ExerciseListItem[];
  muscleGroups: string[];
  equipmentTypes: string[];
  movementPatterns: string[];
  initialMuscle?: string;
}

export function ExerciseLibrary({ items, muscleGroups, equipmentTypes, movementPatterns, initialMuscle = "All" }: ExerciseLibraryProps) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState(initialMuscle);
  const [equipment, setEquipment] = useState("All");
  const [pattern, setPattern] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = `${item.name} ${item.muscleGroup} ${item.equipment} ${item.movementPattern}`.toLowerCase();
      return (
        (!normalized || haystack.includes(normalized)) &&
        (muscle === "All" || item.muscleGroup === muscle) &&
        (equipment === "All" || item.equipment === equipment) &&
        (pattern === "All" || item.movementPattern === pattern) &&
        (difficulty === "All" || item.difficulty === difficulty)
      );
    });
  }, [difficulty, equipment, items, muscle, pattern, query]);

  const hasFilters = query || muscle !== "All" || equipment !== "All" || pattern !== "All" || difficulty !== "All";

  function clearFilters() {
    setQuery("");
    setMuscle("All");
    setEquipment("All");
    setPattern("All");
    setDifficulty("All");
  }

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-y border-border bg-background/95 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chest, cable, glute, row…"
            aria-label="Search exercises"
            className="h-12 rounded-xl bg-card pl-10 text-base"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <FilterSelect label="Muscle" value={muscle} onChange={setMuscle} options={muscleGroups} />
          <FilterSelect label="Equipment" value={equipment} onChange={setEquipment} options={equipmentTypes} />
          <FilterSelect label="Movement" value={pattern} onChange={setPattern} options={movementPatterns} />
          <FilterSelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={["Beginner", "Intermediate", "Advanced"]} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><SlidersHorizontal className="size-4" /> {filtered.length} of {items.length} exercises</span>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 rounded-lg"><X className="size-3.5" /> Clear</Button>
          )}
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.slug} className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
              <Link href={`/exercises/${item.slug}`} className="block focus-visible:outline-none">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    src={item.image}
                    alt={`${item.name} starting position`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{item.muscleGroup}</Badge>
                    <Badge variant="outline">{item.equipment}</Badge>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">{item.name}</h2>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>{item.repRange}</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-10 text-center">
          <h2 className="text-xl font-semibold">No exercises match</h2>
          <p className="mt-2 text-sm text-muted-foreground">Try a broader search or clear one of the filters.</p>
          <Button className="mt-5" onClick={clearFilters}>Clear filters</Button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="All">All {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}
