import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Form / Function — Personal Workout Guide",
    short_name: "Form / Function",
    description: "Weekly workouts, exercise form guides, alternatives, and local progress tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#101712",
    theme_color: "#c9ef4b",
    orientation: "portrait-primary",
    categories: ["fitness", "health", "sports"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
