// הבודק האוטומטי של הקורס.
// שימוש:  npm run check P05-E07   (תרגיל אחד)
//         npm run check P05       (כל התרגילים של פרק 5 שיש להם בדיקות)
//         npm run check PR2 -- --dir ~/dev/tasks-api   (פרויקט שנמצא בתיקייה משלו)
//         npm run check PR2 -- --dir ~/dev/tasks-api --upto 15p
//                         (רק הבודקים מהיחידות עד 15p, כולל — בלי שלבים של פרקים שעוד לא הגעת אליהם)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
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
// --upto <יחידה>: מריצים רק בודקים מתיקיות היחידות עד היחידה הזו (לפי סדר שמות התיקיות: 15-…, 15p-…, 15w-…, 16-…)
const uptoFlag = process.argv.indexOf("--upto");
const upto = uptoFlag === -1 ? undefined : String(process.argv[uptoFlag + 1] ?? "").toLowerCase();
if (!/^(P\d\d(\.\d)?(-E\d{2,3})?|PR\d(-[A-Z0-9]+)?)$/.test(id)) {
  console.log("שימוש: npm run check P05-E07   (או: npm run check P05 לכל הפרק)");
  process.exit(1);
}
const units = fs.readdirSync(root).filter((d) => fs.existsSync(path.join(root, d, "tests"))).sort();
const unitIndex = (code) => units.findIndex((d) => d.toLowerCase().startsWith(code.toLowerCase() + "-"));
let last = units.length - 1;
if (upto !== undefined) {
  last = unitIndex(upto);
  if (last === -1) {
    console.log(`אחרי --upto צריך לבוא קוד של יחידה, למשל 15p או 19. לא נמצאה תיקייה שמתחילה ב־"${upto}-".`);
    process.exit(1);
  }
}
// קובץ בדיקה יכול להצהיר בשורה משלו שהוא שייך ליחידה אחרת מהתיקייה שבה הוא נמצא: "// @unit 15w"
// (למשל PR2-WEB, שיושב עם הפרויקט ב־15p אבל נלמד ביחידה 15.5)
const files = [];
units.forEach((d, i) => {
  const t = path.join(root, d, "tests");
  for (const f of fs.readdirSync(t)) {
    if (!((f.startsWith(id + "-") || f.startsWith(id + ".test")) && f.endsWith(".test.mjs"))) continue;
    const declared = /^\/\/ @unit (\S+)/m.exec(fs.readFileSync(path.join(t, f), "utf8").slice(0, 500))?.[1];
    const at = declared && unitIndex(declared) !== -1 ? unitIndex(declared) : i;
    if (at <= last) files.push(path.join(t, f));
  }
});
if (!files.length) {
  console.log(`לא נמצאו בדיקות אוטומטיות ל־${id}.`);
  console.log("ייתכן שלתרגיל הזה אין בודק (תרגילי הסבר וניבוי), או שתיקיית הפרק עוד לא הועתקה ל־~/dev/backend-course.");
  process.exit(1);
}
console.log(`בודק ${files.length} קובצי בדיקה עבור ${id}${upto ? ` (עד יחידה ${upto})` : ""}${projectDir ? ` (בתיקייה ${projectDir})` : ""}...\n`);
const reporter = path.join(root, "tools", "reporter.mjs");
const major = Number(process.versions.node.split(".")[0]);
const tsFlags = major < 23 ? ["--experimental-strip-types", "--no-warnings"] : [];
// המדווח כותב לכאן "load-fail" אם קובץ לא נטען בכלל (אז אין "מה ציפינו ומה קיבלנו")
const statusFile = path.join(os.tmpdir(), `course-check-${process.pid}.txt`);
const r = spawnSync(process.execPath, [...tsFlags, "--test", `--test-reporter=${reporter}`, ...files], {
  stdio: "inherit",
  env: { ...process.env, CHECK_TARGET: "starter", CHECK_STATUS_FILE: statusFile, ...(projectDir ? { CHECK_DIR: projectDir } : {}) },
});
const loadFail = fs.existsSync(statusFile);
fs.rmSync(statusFile, { force: true });
if (r.status === 0) console.log("\n✔ כל הבדיקות עברו. כל הכבוד!");
else if (loadFail) console.log("\n✘ יש קובץ שלא נטען, ולכן הבדיקות שלו לא רצו. תקן את השגיאה שמוצגת מעל (⚠️) והרץ שוב.");
else console.log("\n✘ יש בדיקות שנכשלו. קרא את ההודעה מעל: מה ציפינו ומה קיבלנו.");
process.exit(r.status ?? 1);
