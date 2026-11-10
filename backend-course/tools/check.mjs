// הבודק האוטומטי של הקורס.
// שימוש:  npm run check P05-E07   (תרגיל אחד)
//         npm run check P05       (כל התרגילים של פרק 5 שיש להם בדיקות)
//         npm run check PR2 -- --dir ~/dev/tasks-api   (פרויקט שנמצא בתיקייה משלו)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// הגדרות מקומיות (למשל COURSE_DATABASE_URL לפרקי SQL) מהקובץ .env בתיקיית הקורס
if (fs.existsSync(path.join(root, ".env"))) process.loadEnvFile(path.join(root, ".env"));
const id = (process.argv[2] || "").toUpperCase();
const dirFlag = process.argv.indexOf("--dir");
const projectDir = dirFlag === -1 ? undefined : path.resolve(process.argv[dirFlag + 1] ?? ".");
if (projectDir && !fs.existsSync(path.join(projectDir, "package.json"))) {
  console.log(`לא נמצא package.json ב־${projectDir}. ודא שהנתיב אחרי --dir הוא תיקיית הפרויקט.`);
  process.exit(1);
}
if (!/^(P\d\d(\.\d)?(-E\d\d)?|PR\d(-[A-Z0-9]+)?)$/.test(id)) {
  console.log("שימוש: npm run check P05-E07   (או: npm run check P05 לכל הפרק)");
  process.exit(1);
}
const files = [];
for (const d of fs.readdirSync(root)) {
  const t = path.join(root, d, "tests");
  if (!fs.existsSync(t)) continue;
  for (const f of fs.readdirSync(t)) if ((f.startsWith(id + "-") || f.startsWith(id + ".test")) && f.endsWith(".test.mjs")) files.push(path.join(t, f));
}
if (!files.length) {
  console.log(`לא נמצאו בדיקות אוטומטיות ל־${id}.`);
  console.log("ייתכן שלתרגיל הזה אין בודק (תרגילי הסבר וניבוי), או שתיקיית הפרק עוד לא הועתקה ל־~/dev/backend-course.");
  process.exit(1);
}
console.log(`בודק ${files.length} קובצי בדיקה עבור ${id}${projectDir ? ` (בתיקייה ${projectDir})` : ""}...\n`);
const reporter = path.join(root, "tools", "reporter.mjs");
const major = Number(process.versions.node.split(".")[0]);
const tsFlags = major < 23 ? ["--experimental-strip-types", "--no-warnings"] : [];
const r = spawnSync(process.execPath, [...tsFlags, "--test", `--test-reporter=${reporter}`, ...files], {
  stdio: "inherit",
  env: { ...process.env, CHECK_TARGET: "starter", ...(projectDir ? { CHECK_DIR: projectDir } : {}) },
});
console.log(r.status === 0 ? "\n✔ כל הבדיקות עברו. כל הכבוד!" : "\n✘ יש בדיקות שנכשלו. קרא את ההודעה מעל: מה ציפינו ומה קיבלנו.");
process.exit(r.status ?? 1);
