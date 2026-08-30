import { TodayDashboard } from "@/components/today-dashboard";
import { exercises } from "@/data/exercises";
import { workoutDays } from "@/data/workouts";

export default function Home() {
  const exerciseMap = Object.fromEntries(exercises.map((exercise) => [exercise.slug, {
    slug: exercise.slug,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    image: exercise.images[0].src,
  }]));
  return <TodayDashboard days={workoutDays} exerciseMap={exerciseMap} />;
}
