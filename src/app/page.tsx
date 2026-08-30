import { TodayDashboard } from "@/components/today-dashboard";
import { exercises } from "@/data/exercises";
import { workoutDays } from "@/data/workouts";

export const dynamic = "force-dynamic";

export default function Home() {
  const now = new Date();
  const serverDayNumber = now.getDay() === 0 ? 7 : now.getDay();
  const serverDateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(now);
  const exerciseMap = Object.fromEntries(exercises.map((exercise) => [exercise.slug, {
    slug: exercise.slug,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    image: exercise.images[0].src,
    repRange: exercise.recommendedRepRange,
    alternatives: exercise.alternatives,
  }]));
  return <TodayDashboard days={workoutDays} exerciseMap={exerciseMap} serverDayNumber={serverDayNumber} serverDateLabel={serverDateLabel} />;
}
