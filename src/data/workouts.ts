export interface WorkoutExercise {
  name?: string;
  exerciseSlug: string;
  sets: string;
  reps: string;
  rest: string;
  note?: string;
}

export interface WorkoutDay {
  day: number;
  slug: string;
  label: string;
  title: string;
  emphasis: string;
  type: "training" | "recovery" | "rest";
  estimatedMinutes: string;
  exercises: WorkoutExercise[];
  recovery?: string[];
}

export const workoutDays: WorkoutDay[] = [
  {
    day: 1,
    slug: "day-1",
    label: "Day 1",
    title: "Upper A",
    emphasis: "Chest + back emphasis",
    type: "training",
    estimatedMinutes: "60–75 min",
    exercises: [
      { exerciseSlug: "machine-chest-press", sets: "3", reps: "6–10", rest: "2–3 min" },
      { exerciseSlug: "overhand-lat-pulldown", sets: "3", reps: "8–12", rest: "2–3 min" },
      { exerciseSlug: "seated-cable-row", sets: "3", reps: "8–12", rest: "2–3 min" },
      { exerciseSlug: "incline-chest-press-machine", sets: "2–3", reps: "8–12", rest: "2–3 min" },
      { exerciseSlug: "lateral-raise-machine", sets: "3", reps: "12–20", rest: "60–90 sec" },
      { exerciseSlug: "rope-pressdown", sets: "2–3", reps: "10–15", rest: "60–120 sec" },
      { exerciseSlug: "cable-curl", sets: "2–3", reps: "10–15", rest: "60–120 sec" },
    ],
  },
  {
    day: 2,
    slug: "day-2",
    label: "Day 2",
    title: "Lower A",
    emphasis: "Quad emphasis",
    type: "training",
    estimatedMinutes: "60–75 min",
    exercises: [
      { exerciseSlug: "hack-squat", sets: "3", reps: "6–10", rest: "2–3 min", note: "45-degree leg press is the first-choice swap." },
      { exerciseSlug: "leg-extension", sets: "3", reps: "10–15", rest: "60–120 sec" },
      { exerciseSlug: "romanian-deadlift", sets: "3", reps: "8–12", rest: "2–3 min" },
      { exerciseSlug: "seated-leg-curl", sets: "3", reps: "10–15", rest: "60–120 sec" },
      { exerciseSlug: "standing-calf-raise-machine", sets: "3", reps: "8–15", rest: "60–120 sec" },
      { exerciseSlug: "cable-crunch", sets: "3", reps: "10–15", rest: "60–90 sec", note: "Use the ab crunch machine if the cable is occupied." },
    ],
  },
  {
    day: 3,
    slug: "day-3",
    label: "Day 3",
    title: "Recovery",
    emphasis: "Easy movement + mobility",
    type: "recovery",
    estimatedMinutes: "25–55 min",
    exercises: [],
    recovery: ["Easy cardio for 20–40 minutes at a conversational pace", "Optional mobility for 5–15 minutes", "Keep effort low enough that tomorrow feels better, not harder"],
  },
  {
    day: 4,
    slug: "day-4",
    label: "Day 4",
    title: "Upper B",
    emphasis: "Shoulders + back emphasis",
    type: "training",
    estimatedMinutes: "60–75 min",
    exercises: [
      { exerciseSlug: "machine-shoulder-press", sets: "3", reps: "6–10", rest: "2–3 min" },
      { exerciseSlug: "chest-supported-row-machine", sets: "3", reps: "6–10", rest: "2–3 min" },
      { exerciseSlug: "neutral-grip-lat-pulldown", sets: "3", reps: "8–12", rest: "2–3 min" },
      { exerciseSlug: "pec-deck", sets: "2–3", reps: "10–15", rest: "60–120 sec", note: "Cable fly is the first-choice swap." },
      { exerciseSlug: "reverse-pec-deck", sets: "3", reps: "12–20", rest: "60–90 sec" },
      { exerciseSlug: "rope-overhead-extension", sets: "2–3", reps: "10–15", rest: "60–120 sec" },
      { exerciseSlug: "preacher-curl-machine", sets: "2–3", reps: "10–15", rest: "60–120 sec" },
    ],
  },
  {
    day: 5,
    slug: "day-5",
    label: "Day 5",
    title: "Lower B",
    emphasis: "Glute + hamstring emphasis",
    type: "training",
    estimatedMinutes: "65–80 min",
    exercises: [
      { exerciseSlug: "hip-thrust-machine", sets: "3", reps: "6–12", rest: "2–3 min" },
      { exerciseSlug: "romanian-deadlift", sets: "3", reps: "6–10", rest: "2–3 min" },
      { exerciseSlug: "45-degree-leg-press", sets: "3", reps: "10–15", rest: "2–3 min" },
      { exerciseSlug: "lying-leg-curl", sets: "3", reps: "10–15", rest: "60–120 sec", note: "Seated leg curl is an equal swap." },
      { exerciseSlug: "hip-abduction-machine", sets: "2–3", reps: "12–20", rest: "60–90 sec" },
      { exerciseSlug: "seated-calf-raise", sets: "3", reps: "10–20", rest: "60–120 sec" },
      { exerciseSlug: "hanging-knee-raise", sets: "2–3", reps: "8–15", rest: "60–90 sec" },
    ],
  },
  {
    day: 6,
    slug: "day-6",
    label: "Day 6",
    title: "Rest",
    emphasis: "Walking + recovery",
    type: "rest",
    estimatedMinutes: "As needed",
    exercises: [],
    recovery: ["Rest or take an easy walk", "Optional easy cardio", "Eat, hydrate, and sleep to support the next training week"],
  },
  {
    day: 7,
    slug: "day-7",
    label: "Day 7",
    title: "Rest",
    emphasis: "Reset for the next week",
    type: "rest",
    estimatedMinutes: "As needed",
    exercises: [],
    recovery: ["Rest or take an easy walk", "Prepare equipment notes and targets for Day 1", "Avoid turning recovery into another hard session"],
  },
];

export const workoutBySlug = new Map(workoutDays.map((day) => [day.slug, day]));

export const trainingPrinciples = [
  "Train major muscle groups approximately twice per week.",
  "Use roughly 6–12 reps for most compound movements.",
  "Use roughly 10–20 reps for most isolation movements.",
  "Finish most working sets with approximately 1–3 reps in reserve.",
  "Rest approximately 2–3 minutes for compounds and 60–120 seconds for isolation work.",
  "Use controlled repetitions and prioritize technique before load increases.",
];
