import Image from "next/image";

import type { Exercise } from "@/data/exercises";

export function ExerciseImagePair({ exercise, priority = false }: { exercise: Exercise; priority?: boolean }) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
      {exercise.images.map((image) => (
        <figure key={image.label} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[4/3] bg-muted">
            <Image
              src={image.src}
              alt={image.alt}
              // Use the same local files as the offline cache, avoiding runtime image processing.
              unoptimized
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
            <figcaption className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground backdrop-blur">
              {image.label}
            </figcaption>
          </div>
        </figure>
      ))}
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">Illustration: <strong className="font-medium text-foreground">{exercise.illustration.upstreamName}</strong>{exercise.illustration.mappingType === "exact" ? "" : " · closest available open illustration of the same or equivalent movement"}. Follow the written setup for this equipment variation.</p>
    </div>
  );
}
