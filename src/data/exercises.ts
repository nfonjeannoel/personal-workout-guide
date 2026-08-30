export type MuscleGroup =
  | "Chest"
  | "Back & Lats"
  | "Shoulders"
  | "Quads"
  | "Hamstrings & Glutes"
  | "Calves"
  | "Biceps & Forearms"
  | "Triceps"
  | "Core";

export type Equipment =
  | "Machine"
  | "Plate-loaded"
  | "Cable"
  | "Dumbbell"
  | "Barbell"
  | "Smith machine"
  | "Bodyweight"
  | "Bench"
  | "Landmine";

export type MovementPattern =
  | "Horizontal push"
  | "Vertical push"
  | "Horizontal pull"
  | "Vertical pull"
  | "Fly"
  | "Squat"
  | "Lunge"
  | "Hinge"
  | "Hip extension"
  | "Hip abduction"
  | "Knee extension"
  | "Knee flexion"
  | "Calf raise"
  | "Elbow flexion"
  | "Elbow extension"
  | "Spinal flexion"
  | "Anti-extension"
  | "Anti-rotation"
  | "Rotation";

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles: string[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  mechanic: "Compound" | "Isolation";
  description: string;
  setup: string[];
  instructions: string[];
  breathing: string;
  formCues: string[];
  commonMistakes: string[];
  machineSetup: string[];
  recommendedRepRange: string;
  recommendedSets: string;
  restSeconds: [number, number];
  rir: string;
  alternatives: string[];
  images: { src: string; alt: string; label: "Start" | "Finish" }[];
  source: string;
  sourceLicense: string;
  sourceExerciseId?: string;
  illustration: {
    upstreamName: string;
    mappingType: string;
  };
}

interface Seed {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  movementPattern: MovementPattern;
  mechanic: "Compound" | "Isolation";
  secondaryMuscles: string[];
  difficulty?: Exercise["difficulty"];
}

const s = (
  name: string,
  muscleGroup: MuscleGroup,
  equipment: Equipment,
  movementPattern: MovementPattern,
  mechanic: Seed["mechanic"],
  secondaryMuscles: string[],
  difficulty: Seed["difficulty"] = "Beginner",
): Seed => ({ name, muscleGroup, equipment, movementPattern, mechanic, secondaryMuscles, difficulty });

export const exerciseSeeds: Seed[] = [
  // Chest
  s("Machine Chest Press", "Chest", "Machine", "Horizontal push", "Compound", ["Triceps", "Front delts"]),
  s("Plate-Loaded Chest Press", "Chest", "Plate-loaded", "Horizontal push", "Compound", ["Triceps", "Front delts"]),
  s("Smith Bench Press", "Chest", "Smith machine", "Horizontal push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Barbell Bench Press", "Chest", "Barbell", "Horizontal push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Dumbbell Bench Press", "Chest", "Dumbbell", "Horizontal push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Incline Chest Press Machine", "Chest", "Machine", "Horizontal push", "Compound", ["Upper chest", "Triceps", "Front delts"]),
  s("Smith Incline Press", "Chest", "Smith machine", "Horizontal push", "Compound", ["Upper chest", "Triceps", "Front delts"], "Intermediate"),
  s("Incline Dumbbell Press", "Chest", "Dumbbell", "Horizontal push", "Compound", ["Upper chest", "Triceps", "Front delts"], "Intermediate"),
  s("Pec Deck", "Chest", "Machine", "Fly", "Isolation", ["Front delts"]),
  s("Cable Fly", "Chest", "Cable", "Fly", "Isolation", ["Front delts"]),
  s("Low-to-High Cable Fly", "Chest", "Cable", "Fly", "Isolation", ["Upper chest", "Front delts"]),
  s("High-to-Low Cable Fly", "Chest", "Cable", "Fly", "Isolation", ["Lower chest", "Front delts"]),
  s("Push-Up", "Chest", "Bodyweight", "Horizontal push", "Compound", ["Triceps", "Front delts", "Core"]),
  s("Assisted Dip", "Chest", "Machine", "Horizontal push", "Compound", ["Triceps", "Front delts"]),
  s("Chest-Biased Dip", "Chest", "Bodyweight", "Horizontal push", "Compound", ["Triceps", "Front delts"], "Advanced"),
  s("Cable Chest Press", "Chest", "Cable", "Horizontal push", "Compound", ["Triceps", "Front delts"]),

  // Back & lats
  s("Overhand Lat Pulldown", "Back & Lats", "Cable", "Vertical pull", "Compound", ["Biceps", "Rear delts"]),
  s("Neutral-Grip Lat Pulldown", "Back & Lats", "Cable", "Vertical pull", "Compound", ["Biceps", "Rear delts"]),
  s("Underhand Lat Pulldown", "Back & Lats", "Cable", "Vertical pull", "Compound", ["Biceps", "Mid back"]),
  s("Single-Arm Cable Pulldown", "Back & Lats", "Cable", "Vertical pull", "Compound", ["Biceps", "Core"]),
  s("Assisted Pull-Up", "Back & Lats", "Machine", "Vertical pull", "Compound", ["Biceps", "Mid back"]),
  s("Pull-Up", "Back & Lats", "Bodyweight", "Vertical pull", "Compound", ["Biceps", "Mid back"], "Advanced"),
  s("Chin-Up", "Back & Lats", "Bodyweight", "Vertical pull", "Compound", ["Biceps", "Mid back"], "Advanced"),
  s("Seated Cable Row", "Back & Lats", "Cable", "Horizontal pull", "Compound", ["Biceps", "Rear delts"]),
  s("Chest-Supported Row Machine", "Back & Lats", "Machine", "Horizontal pull", "Compound", ["Biceps", "Rear delts"]),
  s("Iso-Lateral Plate-Loaded Row", "Back & Lats", "Plate-loaded", "Horizontal pull", "Compound", ["Biceps", "Rear delts"]),
  s("High Row Machine", "Back & Lats", "Machine", "Horizontal pull", "Compound", ["Biceps", "Rear delts"]),
  s("T-Bar Row", "Back & Lats", "Landmine", "Horizontal pull", "Compound", ["Biceps", "Rear delts", "Spinal erectors"], "Intermediate"),
  s("Dumbbell One-Arm Row", "Back & Lats", "Dumbbell", "Horizontal pull", "Compound", ["Biceps", "Rear delts", "Core"], "Intermediate"),
  s("Barbell Row", "Back & Lats", "Barbell", "Horizontal pull", "Compound", ["Biceps", "Rear delts", "Spinal erectors"], "Intermediate"),
  s("Straight-Arm Cable Pulldown", "Back & Lats", "Cable", "Vertical pull", "Isolation", ["Long-head triceps", "Core"]),
  s("Face Pull", "Shoulders", "Cable", "Horizontal pull", "Isolation", ["Rear delts", "Rotator cuff", "Mid back"]),

  // Shoulders
  s("Machine Shoulder Press", "Shoulders", "Machine", "Vertical push", "Compound", ["Triceps", "Front delts"]),
  s("Plate-Loaded Shoulder Press", "Shoulders", "Plate-loaded", "Vertical push", "Compound", ["Triceps", "Front delts"]),
  s("Smith Overhead Press", "Shoulders", "Smith machine", "Vertical push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Dumbbell Shoulder Press", "Shoulders", "Dumbbell", "Vertical push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Arnold Press", "Shoulders", "Dumbbell", "Vertical push", "Compound", ["Triceps", "Front delts"], "Intermediate"),
  s("Lateral Raise Machine", "Shoulders", "Machine", "Vertical push", "Isolation", ["Side delts"]),
  s("Cable Lateral Raise", "Shoulders", "Cable", "Vertical push", "Isolation", ["Side delts"]),
  s("Dumbbell Lateral Raise", "Shoulders", "Dumbbell", "Vertical push", "Isolation", ["Side delts"]),
  s("Reverse Pec Deck", "Shoulders", "Machine", "Horizontal pull", "Isolation", ["Rear delts", "Mid back"]),
  s("Cable Rear-Delt Fly", "Shoulders", "Cable", "Horizontal pull", "Isolation", ["Rear delts", "Mid back"]),

  // Quads
  s("45-Degree Leg Press", "Quads", "Machine", "Squat", "Compound", ["Glutes", "Adductors"]),
  s("Horizontal Leg Press", "Quads", "Machine", "Squat", "Compound", ["Glutes", "Adductors"]),
  s("Hack Squat", "Quads", "Machine", "Squat", "Compound", ["Glutes", "Adductors"]),
  s("Pendulum Squat", "Quads", "Machine", "Squat", "Compound", ["Glutes", "Adductors"]),
  s("Smith Squat", "Quads", "Smith machine", "Squat", "Compound", ["Glutes", "Adductors"], "Intermediate"),
  s("Barbell Back Squat", "Quads", "Barbell", "Squat", "Compound", ["Glutes", "Adductors", "Core"], "Intermediate"),
  s("Front Squat", "Quads", "Barbell", "Squat", "Compound", ["Glutes", "Upper back", "Core"], "Advanced"),
  s("Goblet Squat", "Quads", "Dumbbell", "Squat", "Compound", ["Glutes", "Adductors", "Core"]),
  s("Bulgarian Split Squat", "Quads", "Dumbbell", "Lunge", "Compound", ["Glutes", "Adductors"], "Intermediate"),
  s("Smith Split Squat", "Quads", "Smith machine", "Lunge", "Compound", ["Glutes", "Adductors"], "Intermediate"),
  s("Single-Leg Press", "Quads", "Machine", "Squat", "Compound", ["Glutes", "Adductors"]),
  s("Walking Lunge", "Quads", "Dumbbell", "Lunge", "Compound", ["Glutes", "Adductors"], "Intermediate"),
  s("Reverse Lunge", "Hamstrings & Glutes", "Dumbbell", "Lunge", "Compound", ["Quads", "Adductors"], "Intermediate"),
  s("Step-Up", "Hamstrings & Glutes", "Dumbbell", "Lunge", "Compound", ["Quads", "Adductors"], "Intermediate"),
  s("Leg Extension", "Quads", "Machine", "Knee extension", "Isolation", ["Rectus femoris"]),
  s("Single-Leg Extension", "Quads", "Machine", "Knee extension", "Isolation", ["Rectus femoris"]),

  // Hamstrings & glutes
  s("Romanian Deadlift", "Hamstrings & Glutes", "Barbell", "Hinge", "Compound", ["Spinal erectors", "Adductors"], "Intermediate"),
  s("Smith Romanian Deadlift", "Hamstrings & Glutes", "Smith machine", "Hinge", "Compound", ["Spinal erectors", "Adductors"], "Intermediate"),
  s("Dumbbell Romanian Deadlift", "Hamstrings & Glutes", "Dumbbell", "Hinge", "Compound", ["Spinal erectors", "Adductors"], "Intermediate"),
  s("Cable Pull-Through", "Hamstrings & Glutes", "Cable", "Hinge", "Compound", ["Spinal erectors", "Adductors"]),
  s("Seated Leg Curl", "Hamstrings & Glutes", "Machine", "Knee flexion", "Isolation", ["Calves"]),
  s("Lying Leg Curl", "Hamstrings & Glutes", "Machine", "Knee flexion", "Isolation", ["Calves"]),
  s("Standing Single-Leg Curl", "Hamstrings & Glutes", "Machine", "Knee flexion", "Isolation", ["Calves"]),
  s("Hip Thrust Machine", "Hamstrings & Glutes", "Machine", "Hip extension", "Compound", ["Hamstrings", "Adductors"]),
  s("Smith Hip Thrust", "Hamstrings & Glutes", "Smith machine", "Hip extension", "Compound", ["Hamstrings", "Adductors"], "Intermediate"),
  s("Barbell Hip Thrust", "Hamstrings & Glutes", "Barbell", "Hip extension", "Compound", ["Hamstrings", "Adductors"], "Intermediate"),
  s("Glute Bridge", "Hamstrings & Glutes", "Bodyweight", "Hip extension", "Compound", ["Hamstrings", "Core"]),
  s("45-Degree Back Extension", "Hamstrings & Glutes", "Bench", "Hinge", "Compound", ["Spinal erectors", "Hamstrings"]),
  s("Hip Abduction Machine", "Hamstrings & Glutes", "Machine", "Hip abduction", "Isolation", ["Glute medius", "Glute minimus"]),
  s("Cable Hip Abduction", "Hamstrings & Glutes", "Cable", "Hip abduction", "Isolation", ["Glute medius", "Glute minimus"]),
  s("Cable Kickback", "Hamstrings & Glutes", "Cable", "Hip extension", "Isolation", ["Hamstrings"]),

  // Calves
  s("Standing Calf Raise Machine", "Calves", "Machine", "Calf raise", "Isolation", ["Soleus"]),
  s("Seated Calf Raise", "Calves", "Machine", "Calf raise", "Isolation", ["Soleus"]),
  s("Leg Press Calf Press", "Calves", "Machine", "Calf raise", "Isolation", ["Soleus"]),
  s("Smith Standing Calf Raise", "Calves", "Smith machine", "Calf raise", "Isolation", ["Soleus"]),
  s("Single-Leg Calf Raise", "Calves", "Bodyweight", "Calf raise", "Isolation", ["Soleus"]),

  // Biceps & forearms
  s("Cable Curl", "Biceps & Forearms", "Cable", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Preacher Curl Machine", "Biceps & Forearms", "Machine", "Elbow flexion", "Isolation", ["Forearms"]),
  s("EZ-Bar Curl", "Biceps & Forearms", "Barbell", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Barbell Curl", "Biceps & Forearms", "Barbell", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Dumbbell Curl", "Biceps & Forearms", "Dumbbell", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Incline Dumbbell Curl", "Biceps & Forearms", "Dumbbell", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Bayesian Cable Curl", "Biceps & Forearms", "Cable", "Elbow flexion", "Isolation", ["Forearms"]),
  s("Hammer Curl", "Biceps & Forearms", "Dumbbell", "Elbow flexion", "Isolation", ["Brachialis", "Forearms"]),
  s("Rope Hammer Curl", "Biceps & Forearms", "Cable", "Elbow flexion", "Isolation", ["Brachialis", "Forearms"]),
  s("Reverse Curl", "Biceps & Forearms", "Barbell", "Elbow flexion", "Isolation", ["Brachialis", "Forearms"]),
  s("Wrist Curl", "Biceps & Forearms", "Barbell", "Elbow flexion", "Isolation", ["Wrist flexors"]),
  s("Wrist Extension", "Biceps & Forearms", "Barbell", "Elbow flexion", "Isolation", ["Wrist extensors"]),

  // Triceps
  s("Rope Pressdown", "Triceps", "Cable", "Elbow extension", "Isolation", ["Anconeus"]),
  s("Straight-Bar Pressdown", "Triceps", "Cable", "Elbow extension", "Isolation", ["Anconeus"]),
  s("Single-Arm Pressdown", "Triceps", "Cable", "Elbow extension", "Isolation", ["Anconeus"]),
  s("Rope Overhead Extension", "Triceps", "Cable", "Elbow extension", "Isolation", ["Long head triceps"]),
  s("Single-Arm Cable Overhead Extension", "Triceps", "Cable", "Elbow extension", "Isolation", ["Long head triceps"]),
  s("Seated Dip Machine", "Triceps", "Machine", "Elbow extension", "Compound", ["Chest", "Front delts"]),
  s("Close-Grip Smith Press", "Triceps", "Smith machine", "Horizontal push", "Compound", ["Chest", "Front delts"], "Intermediate"),
  s("EZ-Bar Skull Crusher", "Triceps", "Barbell", "Elbow extension", "Isolation", ["Long head triceps"], "Intermediate"),
  s("Dumbbell Overhead Extension", "Triceps", "Dumbbell", "Elbow extension", "Isolation", ["Long head triceps"]),

  // Core
  s("Cable Crunch", "Core", "Cable", "Spinal flexion", "Isolation", ["Obliques"]),
  s("Ab Crunch Machine", "Core", "Machine", "Spinal flexion", "Isolation", ["Obliques"]),
  s("Decline Weighted Crunch", "Core", "Bench", "Spinal flexion", "Isolation", ["Obliques"]),
  s("Hanging Knee Raise", "Core", "Bodyweight", "Spinal flexion", "Compound", ["Hip flexors", "Grip"]),
  s("Hanging Leg Raise", "Core", "Bodyweight", "Spinal flexion", "Compound", ["Hip flexors", "Grip"], "Advanced"),
  s("Captain's Chair Knee Raise", "Core", "Machine", "Spinal flexion", "Compound", ["Hip flexors"]),
  s("Reverse Crunch", "Core", "Bodyweight", "Spinal flexion", "Isolation", ["Hip flexors"]),
  s("Ab Wheel Rollout", "Core", "Bodyweight", "Anti-extension", "Compound", ["Lats", "Shoulders"], "Advanced"),
  s("Plank", "Core", "Bodyweight", "Anti-extension", "Isolation", ["Glutes", "Shoulders"]),
  s("Side Plank", "Core", "Bodyweight", "Anti-rotation", "Isolation", ["Obliques", "Glute medius"]),
  s("Pallof Press", "Core", "Cable", "Anti-rotation", "Isolation", ["Obliques", "Glutes"]),
  s("Cable Wood Chop", "Core", "Cable", "Rotation", "Compound", ["Obliques", "Shoulders"]),
  s("Dead Bug", "Core", "Bodyweight", "Anti-extension", "Isolation", ["Hip flexors"]),
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const movementCopy: Record<MovementPattern, { setup: string[]; instructions: string[]; cues: string[]; mistakes: string[] }> = {
  "Horizontal push": {
    setup: ["Set the working height so the hands begin around mid-chest.", "Create a stable base with feet planted, ribs stacked, and shoulder blades gently set back."],
    instructions: ["Take a controlled breath and brace before the first rep.", "Press forward while keeping the elbows in a comfortable 30–60 degree path.", "Stop just short of losing shoulder position or overextending the elbows.", "Return slowly until the chest is comfortably stretched, then repeat."],
    cues: ["Chest tall; shoulders down", "Press through the whole hand", "Control the final third of the lowering phase"],
    mistakes: ["Shrugging toward the ears", "Letting the shoulders roll forward at the bottom", "Bouncing or cutting the range short"],
  },
  "Vertical push": {
    setup: ["Set the seat or stance so the hands start just below ear level.", "Brace the trunk and keep the forearms close to vertical."],
    instructions: ["Inhale and create a stable ribcage before pressing.", "Drive the handles or weights upward without leaning back.", "Finish with the arms overhead while keeping the shoulders controlled.", "Lower smoothly to a comfortable depth."],
    cues: ["Stack wrists over elbows", "Keep ribs down", "Reach up without shrugging aggressively"],
    mistakes: ["Turning the press into an incline press", "Flaring the elbows excessively", "Crashing into the bottom position"],
  },
  "Horizontal pull": {
    setup: ["Choose a handle and seat position that allows full reach without rounding the low back.", "Set the chest tall and begin with the shoulder blades free to move."],
    instructions: ["Reach forward under control to lengthen the back muscles.", "Lead the pull with the elbows and draw them toward the torso.", "Pause briefly when the upper arm is in line with the body.", "Return slowly without letting the weight stack slam."],
    cues: ["Elbows drive; hands are hooks", "Keep the neck long", "Finish without leaning backward"],
    mistakes: ["Using torso momentum", "Pulling the shoulders toward the ears", "Over-squeezing far behind the body"],
  },
  "Vertical pull": {
    setup: ["Secure the thighs or establish a strong hanging position.", "Take a grip that keeps the wrists comfortable and lets the shoulders elevate at the top."],
    instructions: ["Begin by drawing the shoulder blades down, then drive the elbows toward the ribs.", "Pull until the upper chest approaches the handle or the elbows reach the sides.", "Pause without leaning far backward.", "Return to full overhead reach under control."],
    cues: ["Elbows to back pockets", "Stay tall through the chest", "Own the overhead stretch"],
    mistakes: ["Pulling behind the neck", "Swinging the torso", "Stopping before the lats are fully lengthened"],
  },
  Fly: {
    setup: ["Align the handles near chest height and keep a soft, fixed bend in the elbows.", "Set the shoulder blades gently back without forcing an exaggerated arch."],
    instructions: ["Open the arms until the chest is comfortably stretched.", "Sweep the arms together in a wide hugging arc.", "Pause when the hands or pads meet without rounding the shoulders.", "Return slowly along the same arc."],
    cues: ["Hug a wide barrel", "Move from the shoulder, not the elbow", "Keep tension at the finish"],
    mistakes: ["Turning the movement into a press", "Overstretching the front of the shoulder", "Using a load that forces momentum"],
  },
  Squat: {
    setup: ["Place the feet where the knees can track naturally over the toes.", "Brace the trunk and establish even pressure through heel, big toe, and little toe."],
    instructions: ["Inhale and brace before descending.", "Bend the knees and hips together while keeping the full foot planted.", "Descend to the deepest position you can control without the pelvis tucking excessively.", "Drive the platform or floor away and stand tall."],
    cues: ["Knees follow toes", "Keep the whole foot heavy", "Control the bottom; drive smoothly"],
    mistakes: ["Heels lifting", "Knees collapsing inward", "Relaxing into the bottom or bouncing"],
  },
  Lunge: {
    setup: ["Choose a stance long enough to keep the front foot planted and the pelvis level.", "Use a support if balance would limit the target muscles."],
    instructions: ["Lower the rear knee while allowing the front knee to track forward naturally.", "Keep the torso angle consistent through the rep.", "Push through the front foot to return.", "Complete controlled reps before changing sides."],
    cues: ["Front foot stays rooted", "Drop down, not just backward", "Keep hips square"],
    mistakes: ["Pushing mostly from the rear leg", "Losing balance to chase load", "Letting the front knee cave inward"],
  },
  Hinge: {
    setup: ["Stand with the load close to the thighs and unlock the knees slightly.", "Brace the trunk with the spine neutral and shoulders set."],
    instructions: ["Push the hips backward while keeping the load close to the legs.", "Lower until the hamstrings are strongly stretched without losing spinal position.", "Drive the hips forward by pushing the floor away.", "Finish tall without leaning backward."],
    cues: ["Close the car door with your hips", "Shins stay nearly vertical", "Keep the load brushing the legs"],
    mistakes: ["Squatting the weight down", "Rounding to chase extra depth", "Hyperextending at lockout"],
  },
  "Hip extension": {
    setup: ["Position the pad or load across the hip crease and plant the feet securely.", "Set the upper-back support below the shoulder blades and tuck the chin slightly."],
    instructions: ["Lower the hips under control while keeping the ribs stacked.", "Drive through the feet and extend the hips.", "Pause when shoulders, hips, and knees form a line.", "Lower without losing foot pressure."],
    cues: ["Belt buckle toward chin", "Finish with glutes, not low back", "Keep shins near vertical at the top"],
    mistakes: ["Overarching the lower back", "Feet too far or too close", "Bouncing off the bottom"],
  },
  "Hip abduction": {
    setup: ["Align the machine pivot or cable with the hip and start from a stable pelvis.", "Use a range that keeps the torso quiet."],
    instructions: ["Move the working leg outward from the hip.", "Pause briefly at the end range without twisting.", "Return slowly until the glute is lengthened.", "Keep steady tension for all reps."],
    cues: ["Move from the outer hip", "Keep toes mostly forward", "Pelvis stays level"],
    mistakes: ["Leaning or rotating to create range", "Using momentum", "Letting the weight stack slam"],
  },
  "Knee extension": {
    setup: ["Align the knee joint with the machine pivot and place the pad above the ankle.", "Set the back pad so the hips remain firmly against the seat."],
    instructions: ["Extend the knees smoothly until the quads are fully shortened.", "Pause without snapping into lockout.", "Lower through the available range for a deep quad stretch.", "Keep the hips down throughout."],
    cues: ["Lift with the quads", "Smooth squeeze at the top", "Lower for two seconds"],
    mistakes: ["Misaligning the knee and machine pivot", "Kicking the weight up", "Hips lifting from the seat"],
  },
  "Knee flexion": {
    setup: ["Align the knee with the machine pivot and place the pad just above the heel.", "Secure the thigh or hips firmly against the support."],
    instructions: ["Curl the pad by bending the knee without moving the hips.", "Pause in the shortened position.", "Return slowly until the hamstrings are fully lengthened.", "Maintain the same tempo for every rep."],
    cues: ["Pull heel toward glute", "Keep hips heavy", "Own the stretched position"],
    mistakes: ["Hips lifting", "Bouncing out of the stretch", "Using a partial range"],
  },
  "Calf raise": {
    setup: ["Place the balls of the feet securely on the platform with room for the heels to move.", "Keep the knees in the position required by the variation."],
    instructions: ["Lower the heels slowly into a comfortable calf stretch.", "Press through the big-toe side of the forefoot and rise as high as possible.", "Pause briefly at the top.", "Return under control without bouncing."],
    cues: ["Full stretch, full rise", "Keep ankles from rolling out", "Pause at both ends"],
    mistakes: ["Bouncing through the bottom", "Using a tiny range", "Shifting pressure to the outside of the foot"],
  },
  "Elbow flexion": {
    setup: ["Choose a grip that keeps the wrists neutral and set the upper arms in a stable position.", "Begin with the elbows nearly extended and the biceps lengthened."],
    instructions: ["Curl by bending the elbows without swinging the torso.", "Squeeze at the top while keeping the wrists stacked.", "Lower until the elbows are almost straight.", "Keep continuous tension between reps."],
    cues: ["Upper arms stay quiet", "Lead with the little-finger side for supinated curls", "Lower slowly"],
    mistakes: ["Swinging the hips", "Letting elbows drift excessively", "Bending the wrists to finish the rep"],
  },
  "Elbow extension": {
    setup: ["Set the upper arms in a stable position and choose a grip that keeps wrists comfortable.", "Start with the triceps lengthened and shoulders controlled."],
    instructions: ["Extend the elbows until the arms are straight without moving the shoulders.", "Pause and contract the triceps.", "Return slowly to the stretched position.", "Keep the torso still for every rep."],
    cues: ["Only the forearms move", "Finish long through the elbows", "Keep wrists neutral"],
    mistakes: ["Using shoulder movement", "Flaring elbows without control", "Letting the weight pull the body out of position"],
  },
  "Spinal flexion": {
    setup: ["Set the pelvis and ribcage so the abdominals can shorten without hip momentum.", "Choose a load that allows a smooth curl through the trunk."],
    instructions: ["Exhale and draw the ribs toward the pelvis.", "Pause in the shortened position without pulling on the neck.", "Return slowly until the abdominals are lengthened.", "Reset the brace before the next rep."],
    cues: ["Ribs toward belt buckle", "Curl; do not just hinge", "Exhale fully at the finish"],
    mistakes: ["Pulling with the arms or neck", "Moving only at the hips", "Rushing the return"],
  },
  "Anti-extension": {
    setup: ["Stack the ribs over the pelvis and lightly squeeze the glutes.", "Begin with a range you can control without the low back arching."],
    instructions: ["Brace as if preparing for a punch.", "Extend the limbs or body while maintaining trunk position.", "Pause before the low back begins to arch.", "Return under control and reset."],
    cues: ["Ribs down", "Keep belt buckle tipped up", "Move only as far as you can brace"],
    mistakes: ["Sagging through the lower back", "Holding the breath too long", "Chasing range at the expense of position"],
  },
  "Anti-rotation": {
    setup: ["Square the shoulders and hips and establish a stable stance.", "Position the resistance to pull across the body."],
    instructions: ["Brace the trunk and press or hold the arms away from the body.", "Resist turning toward the resistance.", "Breathe behind the brace for the prescribed time or reps.", "Return slowly and repeat on the other side."],
    cues: ["Belt buckle and sternum face forward", "Stay tall", "Exhale without losing position"],
    mistakes: ["Rotating toward the cable", "Leaning away from resistance", "Using too narrow a stance to control"],
  },
  Rotation: {
    setup: ["Take an athletic stance with hips and ribs stacked.", "Set the cable path so it can travel diagonally without obstruction."],
    instructions: ["Initiate the turn through the trunk while keeping the arms connected to the torso.", "Rotate through a controlled range.", "Slow the resistance before the end position.", "Return smoothly and complete both sides."],
    cues: ["Turn as one unit", "Control the return", "Keep knees tracking with feet"],
    mistakes: ["Yanking with the arms", "Twisting only through the lower back", "Letting the cable snap back"],
  },
};

function equipmentSetup(equipment: Equipment): string[] {
  const notes: Record<Equipment, string[]> = {
    Machine: ["Adjust the seat and pads before loading the working weight.", "Match the machine pivot to the joint being trained whenever a pivot marker is present."],
    "Plate-loaded": ["Load both sides evenly and confirm the seat position before the first working set.", "Test the empty machine path because leverage varies by brand."],
    Cable: ["Set the pulley height before selecting the load.", "Stand or sit far enough away to keep cable tension at both ends of the repetition."],
    Dumbbell: ["Clear a safe path for picking up and setting down the dumbbells.", "Use a controlled kick-up or a spotter for heavy pressing variations."],
    Barbell: ["Set safeties just below the lowest controlled position.", "Center the plates and use collars where appropriate."],
    "Smith machine": ["Set the safety stops just below the bottom of your range.", "Place the body so the fixed bar path matches your natural joint path."],
    Bodyweight: ["Choose a stable support surface and clear the space around you.", "Use assistance or elevation to match the prescribed rep range."],
    Bench: ["Confirm the bench is stable and set the angle before loading.", "Keep all contact points secure throughout the set."],
    Landmine: ["Secure the bar in a landmine base or stable corner attachment.", "Use a close handle and keep the plates clear of the torso."],
  };
  return notes[equipment];
}

function descriptionFor(seed: Seed) {
  const target = seed.muscleGroup === "Back & Lats" ? "back and lat musculature" : seed.muscleGroup.toLowerCase();
  return `${seed.name} is a ${seed.mechanic.toLowerCase()} ${seed.movementPattern.toLowerCase()} exercise for the ${target}. Use a controlled range that keeps the target muscles loaded and the joints comfortable.`;
}

const attributionBySlug = new Map(imageAttribution.map((item) => [item.slug, item]));

function specificSetup(seed: Seed): string[] {
  const name = seed.name.toLowerCase();
  if (name.includes("chest press") || name.includes("bench press")) return ["Set the bench or seat so the handles or bar meet the lower-to-mid chest.", "Plant the feet, keep the shoulder blades gently back and down, and use a grip that leaves the forearms vertical at the bottom."];
  if (name.includes("fly") || name.includes("pec deck")) return ["Set the handles or pulleys so the hands travel through chest height.", "Start with a soft elbow bend and only open as far as the front of the shoulder remains comfortable."];
  if (name.includes("pulldown") || name.includes("pull-up") || name.includes("chin-up")) return ["Secure the thighs under the pad or choose enough assistance to keep the torso stable.", `Use the ${name.includes("neutral") ? "parallel" : name.includes("underhand") || name.includes("chin") ? "palms-toward-you" : "palms-away"} grip and begin with the shoulders elevated without losing rib position.`];
  if (name.includes("row")) return ["Set the handle or chest pad so the arms can fully reach without the shoulders rolling forward.", "Brace the torso and choose an elbow path that points toward the intended part of the back."];
  if (name.includes("shoulder press") || name.includes("overhead press") || name.includes("arnold")) return ["Set the seat close to upright and position the handles or weights just outside shoulder width.", "Keep the ribs stacked over the pelvis and begin with the forearms close to vertical."];
  if (name.includes("lateral raise")) return ["Position the machine pivot, cable, or dumbbells so resistance begins without a shrug.", "Lead with the elbows in the shoulder-blade plane and stop around shoulder height."];
  if (name.includes("rear-delt") || name.includes("reverse pec") || name.includes("face pull")) return ["Set the handles near shoulder or eye height and keep the chest supported when a pad is available.", "Reach forward without rounding, then move the elbows wide while keeping the neck relaxed."];
  if (name.includes("leg press") || name.includes("hack squat") || name.includes("pendulum")) return ["Place the feet where the knees can track over the middle toes through a deep, pain-free range.", "Adjust the back pad and safety stops before loading, then keep the hips and low back supported."];
  if (name.includes("squat")) return ["Choose a stance that lets the knees track with the toes and the whole foot stay planted.", "Set the bar, safeties, or dumbbell securely and brace before leaving the start position."];
  if (name.includes("lunge") || name.includes("split squat") || name.includes("step-up")) return ["Choose a step length and platform height that keep the working foot flat and the pelvis level.", "Use light support if balance would otherwise limit the target leg."];
  if (name.includes("leg extension")) return ["Align the machine pivot with the knee and place the shin pad just above the ankle.", "Set the back pad so the hips stay down while the knee can bend comfortably."];
  if (name.includes("deadlift") || name.includes("pull-through") || name.includes("back extension")) return ["Set the feet about hip width and begin with the load close to the body or cable between the legs.", "Unlock the knees, brace, and push the hips back until the hamstrings are loaded without rounding the spine."];
  if (name.includes("leg curl")) return ["Align the machine pivot with the knee and place the roller just above the heel.", "Secure the thigh or hip pad so the pelvis cannot lift as the knee bends."];
  if (name.includes("hip thrust") || name.includes("glute bridge")) return ["Place the pad across the hip crease and position the feet so the shins approach vertical at lockout.", "Set the upper back securely, tuck the chin slightly, and brace before driving the hips up."];
  if (name.includes("abduction") || name.includes("kickback")) return ["Set the pad, cuff, or stance so the hip moves freely without the torso having to lean.", "Hold a stable support and begin with the pelvis square rather than rotated open."];
  if (name.includes("calf")) return ["Place the ball of the working foot securely on the platform with the heel free to move.", "Straighten or bend the knee as the variation requires and keep pressure through the big-toe side of the foot."];
  if (name.includes("curl") && !name.includes("leg")) return ["Position the upper arms so the elbows can remain still and the biceps begin lengthened.", "Choose a handle and wrist angle that allow a full curl without bending the wrist."];
  if (name.includes("wrist")) return ["Support the forearms on a bench or thighs with the wrists just beyond the edge.", "Use a light load that permits controlled wrist motion without moving the elbows."];
  if (name.includes("pressdown")) return ["Set the pulley high and stand far enough away that the cable clears the body.", "Pin the upper arms beside the torso and begin with the elbows fully bent."];
  if (name.includes("triceps") || name.includes("extension") || name.includes("skull") || name.includes("close-grip") || name.includes("dip")) return ["Arrange the bench, cable, or handles so the upper arms remain stable and the elbows move comfortably.", "Use a grip that keeps the wrists stacked and start with the triceps under a controlled stretch."];
  if (seed.muscleGroup === "Core") return ["Set the resistance and body position so the ribs begin stacked over the pelvis.", "Brace before moving and choose a range that does not create pulling in the low back or neck."];
  return movementCopy[seed.movementPattern].setup;
}

function specificCues(seed: Seed, base: string[]) {
  const cues = [...base];
  if (seed.name.toLowerCase().includes("single") || seed.name.toLowerCase().includes("one-arm") || seed.name.toLowerCase().includes("one-leg")) cues.unshift("Keep the pelvis and ribs square; match both sides");
  if (seed.equipment === "Smith machine") cues.unshift("Let the fixed rail guide the load; adjust your stance instead of fighting its path");
  if (seed.equipment === "Cable") cues.unshift("Keep the cable aligned with the moving limb from start to finish");
  if (seed.equipment === "Machine" || seed.equipment === "Plate-loaded") cues.unshift("Stay in contact with the pads and keep the machine pivot aligned");
  return [...new Set(cues)].slice(0, 4);
}

const genericInstructionSlugs = new Set([
  "lateral-raise-machine", "cable-hip-abduction", "hip-thrust-machine", "smith-hip-thrust",
  "single-leg-press", "single-leg-calf-raise", "assisted-dip", "seated-dip-machine",
]);

const baseExercises: Exercise[] = exerciseSeeds.map((seed) => {
  const slug = slugify(seed.name);
  const copy = movementCopy[seed.movementPattern];
  const isolation = seed.mechanic === "Isolation";
  const attribution = attributionBySlug.get(slug);
  if (!attribution) throw new Error(`Missing image attribution for ${seed.name}`);
  const importedInstructions = attribution.upstreamInstructions.filter((item) => typeof item === "string" && item.trim().length > 0);
  return {
    id: slug,
    slug,
    name: seed.name,
    muscleGroup: seed.muscleGroup,
    secondaryMuscles: seed.secondaryMuscles,
    equipment: seed.equipment,
    movementPattern: seed.movementPattern,
    difficulty: seed.difficulty ?? "Beginner",
    mechanic: seed.mechanic,
    description: descriptionFor(seed),
    setup: [...equipmentSetup(seed.equipment), ...specificSetup(seed)],
    instructions: !genericInstructionSlugs.has(slug) && importedInstructions.length >= 2 ? importedInstructions : copy.instructions,
    breathing: isolation
      ? "Exhale through the effort or shortened position; inhale during the controlled return. Keep the trunk quietly braced."
      : "Inhale and brace before the lowering phase, then exhale gradually through the hardest part of the repetition without losing trunk position.",
    formCues: specificCues(seed, copy.cues),
    commonMistakes: copy.mistakes,
    machineSetup: [...equipmentSetup(seed.equipment), ...specificSetup(seed)],
    recommendedRepRange: isolation ? "10–20 reps" : "6–12 reps",
    recommendedSets: isolation ? "2–3 working sets" : "3 working sets",
    restSeconds: isolation ? [60, 120] : [120, 180],
    rir: "Finish most working sets with 1–3 reps in reserve",
    alternatives: [],
    images: [
      { src: `/exercises/${slug}/start.jpg`, alt: `${seed.name} starting position`, label: "Start" },
      { src: `/exercises/${slug}/finish.jpg`, alt: `${seed.name} finishing position`, label: "Finish" },
    ],
    source: "Free Exercise DB by yuhonas, with original editorial guidance for this project",
    sourceLicense: "Upstream dataset and images published under the Unlicense",
    sourceExerciseId: attribution.upstreamId,
    illustration: { upstreamName: attribution.upstreamName, mappingType: attribution.mappingType },
  };
});

export const exercises: Exercise[] = baseExercises.map((exercise) => {
  const exactPattern = baseExercises.filter(
    (candidate) =>
      candidate.slug !== exercise.slug &&
      candidate.muscleGroup === exercise.muscleGroup &&
      candidate.movementPattern === exercise.movementPattern,
  );
  const sameMuscle = baseExercises.filter(
    (candidate) => candidate.slug !== exercise.slug && candidate.muscleGroup === exercise.muscleGroup,
  );
  const candidates = [...exactPattern, ...sameMuscle].filter(
    (candidate, index, array) => array.findIndex((item) => item.slug === candidate.slug) === index,
  );
  const varied = candidates.sort((a, b) => {
    const aDifferent = a.equipment === exercise.equipment ? 1 : 0;
    const bDifferent = b.equipment === exercise.equipment ? 1 : 0;
    return aDifferent - bDifferent;
  });
  return { ...exercise, alternatives: varied.slice(0, 8).map((candidate) => candidate.slug) };
});

export const exerciseBySlug = new Map(exercises.map((exercise) => [exercise.slug, exercise]));
export const muscleGroups = [...new Set(exercises.map((exercise) => exercise.muscleGroup))];
export const equipmentTypes = [...new Set(exercises.map((exercise) => exercise.equipment))];
export const movementPatterns = [...new Set(exercises.map((exercise) => exercise.movementPattern))];

export function getExercise(slug: string) {
  return exerciseBySlug.get(slug);
}

export function getAlternatives(exercise: Exercise) {
  return exercise.alternatives
    .map((slug) => exerciseBySlug.get(slug))
    .filter((item): item is Exercise => Boolean(item));
}
import imageAttribution from "@/data/image-attribution.json";
