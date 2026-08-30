import type { MetadataRoute } from "next";

import { exercises, muscleGroups, slugify } from "@/data/exercises";
import { workoutDays } from "@/data/workouts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/workout", "/exercises", "/progression", "/guides", "/about", "/sources"];
  return [
    ...staticRoutes.map((path, index) => ({ url: `${siteUrl}${path}`, changeFrequency: "weekly" as const, priority: index === 0 ? 1 : 0.7 })),
    ...workoutDays.map((day) => ({ url: `${siteUrl}/workout/${day.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...muscleGroups.map((muscle) => ({ url: `${siteUrl}/muscles/${slugify(muscle)}`, changeFrequency: "monthly" as const, priority: 0.65 })),
    ...exercises.map((exercise) => ({ url: `${siteUrl}/exercises/${exercise.slug}`, changeFrequency: "monthly" as const, priority: 0.75, images: exercise.images.map((image) => `${siteUrl}${image.src}`) })),
  ];
}
