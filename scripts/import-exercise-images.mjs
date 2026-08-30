import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const upstreamRoot = path.resolve(process.argv[2] ?? "../../work/free-exercise-db");
const seedFile = path.join(projectRoot, "src", "data", "exercises.ts");
const upstreamFile = path.join(upstreamRoot, "dist", "exercises.json");

if (!fs.existsSync(upstreamFile)) {
  throw new Error(`Free Exercise DB not found at ${upstreamRoot}`);
}

const seedText = fs.readFileSync(seedFile, "utf8");
const names = [...seedText.matchAll(/^\s*s\("([^"]+)"/gm)].map((match) => match[1]);
const upstream = JSON.parse(fs.readFileSync(upstreamFile, "utf8"));

const aliases = {
  "Machine Chest Press": "Leverage Chest Press",
  "Plate-Loaded Chest Press": "Leverage Chest Press",
  "Incline Chest Press Machine": "Leverage Incline Chest Press",
  "Pec Deck": "Butterfly",
  "Low-to-High Cable Fly": "Incline Cable Flye",
  "High-to-Low Cable Fly": "Decline Cable Flye",
  "Assisted Dip": "Bench Dips",
  "Chest-Biased Dip": "Dips - Chest Version",
  "Overhand Lat Pulldown": "Wide-Grip Lat Pulldown",
  "Neutral-Grip Lat Pulldown": "Close-Grip Front Lat Pulldown",
  "Underhand Lat Pulldown": "Underhand Cable Pulldowns",
  "Single-Arm Cable Pulldown": "One Arm Lat Pulldown",
  "Assisted Pull-Up": "Assisted Chin-Up",
  "Chest-Supported Row Machine": "Leverage High Row",
  "Iso-Lateral Plate-Loaded Row": "Leverage High Row",
  "High Row Machine": "Leverage High Row",
  "T-Bar Row": "T-Bar Row with Handle",
  "Dumbbell One-Arm Row": "One-Arm Dumbbell Row",
  "Straight-Arm Cable Pulldown": "Straight-Arm Pulldown",
  "Machine Shoulder Press": "Leverage Shoulder Press",
  "Plate-Loaded Shoulder Press": "Leverage Shoulder Press",
  "Lateral Raise Machine": "Machine Side Lateral Raise",
  "Reverse Pec Deck": "Reverse Machine Flyes",
  "Cable Rear-Delt Fly": "Rear Delt Cable Fly",
  "45-Degree Leg Press": "Leg Press",
  "Horizontal Leg Press": "Leg Press",
  "Hack Squat": "Hack Squat",
  "Pendulum Squat": "Hack Squat",
  "Smith Squat": "Smith Machine Squat",
  "Smith Split Squat": "Smith Machine Squat",
  "Single-Leg Press": "Single-Leg Press",
  "Single-Leg Extension": "Leg Extensions",
  "Smith Romanian Deadlift": "Romanian Deadlift",
  "Dumbbell Romanian Deadlift": "Dumbbell Stiff Leg Deadlift",
  "Standing Single-Leg Curl": "Standing Leg Curl",
  "Hip Thrust Machine": "Barbell Hip Thrust",
  "Smith Hip Thrust": "Barbell Hip Thrust",
  "Glute Bridge": "Butt Lift (Bridge)",
  "45-Degree Back Extension": "Hyperextensions (Back Extensions)",
  "Hip Abduction Machine": "Thigh Abductor",
  "Cable Hip Abduction": "Hip Abduction",
  "Cable Kickback": "Kneeling Squat",
  "Standing Calf Raise Machine": "Standing Calf Raises",
  "Seated Calf Raise": "Seated Calf Raise",
  "Leg Press Calf Press": "Calf Press On The Leg Press Machine",
  "Smith Standing Calf Raise": "Standing Calf Raises",
  "Single-Leg Calf Raise": "Single-Leg Calf Raise",
  "Cable Curl": "Cable Hammer Curls - Rope Attachment",
  "Preacher Curl Machine": "Preacher Curl",
  "EZ-Bar Curl": "EZ-Bar Curl",
  "Bayesian Cable Curl": "Lying High Bench Barbell Curl",
  "Rope Hammer Curl": "Cable Hammer Curls - Rope Attachment",
  "Wrist Extension": "Reverse Barbell Curl",
  "Rope Pressdown": "Triceps Pushdown - Rope Attachment",
  "Straight-Bar Pressdown": "Triceps Pushdown",
  "Single-Arm Pressdown": "One Arm Pronated Dumbbell Triceps Extension",
  "Rope Overhead Extension": "Cable Rope Overhead Triceps Extension",
  "Single-Arm Cable Overhead Extension": "One Arm Supinated Dumbbell Triceps Extension",
  "Seated Dip Machine": "Bench Dips",
  "Close-Grip Smith Press": "Close-Grip Barbell Bench Press",
  "EZ-Bar Skull Crusher": "EZ-Bar Skullcrusher",
  "Ab Crunch Machine": "Ab Crunch Machine",
  "Captain's Chair Knee Raise": "Knee/Hip Raise On Parallel Bars",
  "Reverse Crunch": "Reverse Crunch",
  "Pallof Press": "Pallof Press",
  "Cable Wood Chop": "Cable Seated Crunch",
  "Dead Bug": "Dead Bug",
};

const stop = new Set(["machine", "plate", "loaded", "degree", "smith", "cable", "barbell", "dumbbell", "bodyweight", "the", "with", "raise", "press"]);
const synonyms = new Map([
  ["flye", "fly"],
  ["flies", "fly"],
  ["pushdown", "pressdown"],
  ["pulldowns", "pulldown"],
  ["rows", "row"],
  ["extensions", "extension"],
  ["curls", "curl"],
  ["deltoid", "delt"],
  ["chest", "pectoral"],
]);

function tokens(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((token) => synonyms.get(token) ?? token)
    .filter((token) => token.length > 1 && !stop.has(token));
}

function score(targetName, candidate) {
  const target = tokens(targetName);
  const source = tokens(candidate.name);
  const overlap = target.filter((token) => source.includes(token)).length;
  const union = new Set([...target, ...source]).size || 1;
  const jaccard = overlap / union;
  const exactBoost = targetName.toLowerCase() === candidate.name.toLowerCase() ? 4 : 0;
  const coverage = overlap / Math.max(1, target.length);
  return exactBoost + coverage * 2 + jaccard;
}

function slugify(value) {
  return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const manifest = [];
for (const name of names) {
  const preferredName = aliases[name] ?? name;
  const exact = upstream.find((item) => item.name.toLowerCase() === preferredName.toLowerCase());
  const ranked = upstream
    .filter((item) => Array.isArray(item.images) && item.images.length >= 2)
    .map((item) => ({ item, score: score(preferredName, item) }))
    .sort((a, b) => b.score - a.score);
  const match = exact ?? ranked[0]?.item;
  const matchScore = exact ? 10 : ranked[0]?.score ?? 0;
  if (!match) throw new Error(`No image match for ${name}`);

  const slug = slugify(name);
  const outputDirectory = path.join(projectRoot, "public", "exercises", slug);
  fs.mkdirSync(outputDirectory, { recursive: true });
  const sourceStart = path.join(upstreamRoot, "exercises", match.images[0]);
  const sourceFinish = path.join(upstreamRoot, "exercises", match.images[1]);
  fs.copyFileSync(sourceStart, path.join(outputDirectory, "start.jpg"));
  fs.copyFileSync(sourceFinish, path.join(outputDirectory, "finish.jpg"));
  manifest.push({
    slug,
    exerciseName: name,
    upstreamName: match.name,
    upstreamId: match.id,
    upstreamImages: match.images.slice(0, 2),
    matchScore: Number(matchScore.toFixed(3)),
    sourceUrl: `https://github.com/yuhonas/free-exercise-db/tree/main/exercises/${match.id}`,
    license: "Unlicense",
  });
}

const manifestPath = path.join(projectRoot, "src", "data", "image-attribution.json");
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const licenseDirectory = path.join(projectRoot, "THIRD_PARTY_LICENSES");
fs.mkdirSync(licenseDirectory, { recursive: true });
fs.copyFileSync(path.join(upstreamRoot, "LICENSE.md"), path.join(licenseDirectory, "FREE_EXERCISE_DB_LICENSE.md"));

const lowConfidence = manifest.filter((item) => item.matchScore < 1.35);
console.log(`Imported ${manifest.length * 2} images for ${manifest.length} exercises.`);
console.log(`Low-confidence automatic matches: ${lowConfidence.length}`);
for (const item of lowConfidence) {
  console.log(`${item.exerciseName} -> ${item.upstreamName} (${item.matchScore})`);
}
