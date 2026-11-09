// מייצר את README.md שבשורש המאגר מתוך הנתונים של הפרקים (chapter.mjs, exercises.txt, tests/).
// שימוש: node course-src/scripts/make-readme.mjs   (להריץ אחרי כל פרק חדש)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(SRC, "..");
const CHAPTERS = path.join(SRC, "chapters");
const OUT = path.join(ROOT, "backend-course");
const REPO = "yeudaba/backend-course-he";

// ---------- נתונים ----------
const ICONS = {
  "00-setup": "🧰", "01-values-variables": "🔤", "02-operators-strings": "➗", "03-conditions": "🔀", "04-loops": "🔁",
  "05-functions": "🧩", "06-arrays": "📚", "07-objects": "🗂️", "08-modules-errors": "🐞", "08p-project-expenses": "💰",
  "09-git": "🌿", "10-async": "⏳", "11-typescript": "🔷", "12-design": "📐", "13-node-npm": "📦", "14-http": "🌐",
  "15-express": "🚂", "15p-project-tasks": "✅", "15w-web-bridge": "🎨", "16-sql": "🗄️", "17-relations": "🔗",
  "18-consistency": "⚖️", "19-prisma": "🔺", "20-nestjs": "🐈", "21-auth": "🔐", "22-testing": "🧪", "23-docker": "🐳", "24-production": "🏭", "25-deploy": "🚀", "25p-project-shop": "☕", "19w-mysql": "🐬", "25w-cloud": "☁️", "26-redis": "⚡", "26w-messaging": "📨", "27-algorithms": "🧠", "28-system-design": "🏗️", "28w-scale": "🚦", "29-ai-backend": "🤖", "29w-agents": "🦾", "29x-project-events": "📊", "30-career": "💼",
};

// מה שעוד לא נבנה — לפי הסדר בקורס (slug קובע את המקום בטבלה)
const PLANNED = [
  { slug: "19w-mysql", part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי", label: "יחידה 19.5", icon: "🐬", title: "MySQL", topics: "מ־PostgreSQL ל־MySQL: הבדלים, נעילות, mysql2" },
  { slug: "25w-cloud", part: "חטיבה ד׳ — רמת תעשייה", label: "יחידה 25.5", icon: "☁️", title: "ענן ו־Kubernetes", topics: "AWS (IAM, S3, SQS, RDS, ElastiCache, ECS), Kubernetes, Helm, Jenkins, Argo CD" },
  { slug: "26w-messaging", part: "חטיבה ה׳ — ראיונות והרחבות", label: "יחידה 26.5", icon: "📨", title: "תורים ואירועים", topics: "RabbitMQ, Kafka, SQS" },
  { slug: "28w-scale", part: "חטיבה ה׳ — ראיונות והרחבות", label: "יחידה 28.5", icon: "🚦", title: "ביצועים ונתונים בקנה מידה", topics: "בדיקות עומס, profiling, OLAP ומסדים עמודתיים: BigQuery, Snowflake, Databricks" },
  { slug: "29w-agents", part: "חטיבה ה׳ — ראיונות והרחבות", label: "יחידה 29.5", icon: "🤖", title: "סוכני AI בפרודקשן", topics: "agentic AI: לולאות, כלים, MCP, guardrails, evals" },
  { slug: "29x-project-events", part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרויקט 4", icon: "📊", title: "מערכת אירועים ואנליטיקה", topics: "Kafka, MySQL, מסד עמודתי, Kubernetes" },
];

// פרק 0 נכתב ביד ישירות ב־backend-course — את השיעורים קוראים משם
function handwrittenLessons(slug) {
  const dir = path.join(OUT, slug);
  return fs.readdirSync(dir).filter((f) => /^lesson-.*\.html$/.test(f)).sort().map((f) => {
    const h1 = /<h1>([^<]*)<\/h1>/.exec(fs.readFileSync(path.join(dir, f), "utf8"))?.[1] ?? f;
    return { title: h1.replace(/^שיעור \d+ — /, "") };
  });
}

const countMatches = (file, re) => (fs.existsSync(file) ? (fs.readFileSync(file, "utf8").match(re) ?? []).length : 0);

const chapters = [];
for (const slug of fs.readdirSync(CHAPTERS).sort()) {
  const metaFile = path.join(CHAPTERS, slug, "chapter.mjs");
  if (!fs.existsSync(metaFile)) continue;
  const ch = (await import(pathToFileURL(metaFile).href)).default;
  const dir = path.join(CHAPTERS, slug);
  const lessons = ch.handwritten ? handwrittenLessons(slug) : ch.lessons ?? [];
  const exercises = ch.handwritten
    ? new Set(fs.readFileSync(path.join(OUT, slug, "exercises.html"), "utf8").match(/id="P\d+-E\d+"/g)).size
    : countMatches(path.join(dir, "exercises.txt"), /^@@ P[\w.]+-E\d+ \|/gm);
  const tests = fs.existsSync(path.join(dir, "tests")) ? fs.readdirSync(path.join(dir, "tests")).filter((f) => f.endsWith(".test.mjs")).length : 0;
  let runs = countMatches(path.join(dir, "exercises.txt"), /^```\w+[^\n]*\b(run|tsc)\b/gm);
  for (const l of ch.lessons ?? []) runs += countMatches(path.join(dir, l.file), /^```\w+[^\n]*\b(run|tsc)\b/gm);
  chapters.push({ slug, ...ch, label: ch.label ?? `פרק ${ch.num}`, lessons, exercises, tests, runs, icon: ICONS[slug] ?? "📘" });
}

const sum = (k) => chapters.reduce((a, c) => a + (typeof c[k] === "number" ? c[k] : c[k].length), 0);
const stats = { units: chapters.length, lessons: sum("lessons"), exercises: sum("exercises"), tests: sum("tests"), runs: sum("runs") };
const parts = [...new Set([...chapters.map((c) => c.part), ...PLANNED.map((p) => p.part)])];
const isProject = (c) => /פרויקט/.test(c.label);

// ---------- עזרים ----------
// GitHub מציג Markdown משמאל לימין. כל הטקסט עטוף ב־<div dir="rtl"> — כך גם הטבלאות מתחילות מימין.
// קוד נשאר מחוץ ל־div, כדי שיוצג משמאל לימין כמו שהוא.
const rtl = (text) => `<div dir="rtl">\n\n${text.trim()}\n\n</div>`;
const bar = (done, total, width = 10) => {
  const full = total ? Math.round((done / total) * width) : 0;
  return "▰".repeat(full) + "▱".repeat(width - full);
};
const chapterLink = (c) => `[${c.label}](backend-course/${c.slug}/index.html)`;

function partTable(part) {
  const built = new Set(chapters.map((c) => c.slug));
  const rows = [
    ...chapters.filter((c) => c.part === part).map((c) => ({ slug: c.slug, row:
      `| ${chapterLink(c)} | ${c.title}${c.fast ? " <sub>(רענון)</sub>" : ""} | ${c.lessons.length} | ${c.exercises || "—"} | ${c.tests || "—"} | ✔ |` })),
    ...PLANNED.filter((p) => p.part === part && !built.has(p.slug)).map((p) => ({ slug: p.slug, row: `| ${p.label} | ${p.title} <br><sub>${p.topics}</sub> | | | | בתוכנית |` })),
  ].sort((x, y) => (x.slug < y.slug ? -1 : 1)).map((x) => x.row);
  return ["| פרק | נושא | שיעורים | תרגילים | בדיקות | מצב |", "|---|---|:-:|:-:|:-:|:-:|", ...rows].join("\n");
}

function lessonsList(part) {
  return chapters
    .filter((c) => c.part === part)
    .map((c) => `**${c.label} — ${c.title}**\n\n${c.lessons.map((l, i) => `${i + 1}. ${l.title}${l.note ? ` <sub>${l.note}</sub>` : ""}`).join("\n")}`)
    .join("\n\n");
}

function progressTable() {
  const rows = parts.map((part) => {
    const done = chapters.filter((c) => c.part === part).length;
    const total = done + PLANNED.filter((p) => p.part === part && !chapters.some((c) => c.slug === p.slug)).length;
    const [name, sub] = part.split(" — ");
    return `| **${name}** | ${sub} | <code>${bar(done, total)}</code> | ${done}/${total} |`;
  });
  return ["| חטיבה | מה לומדים | התקדמות | |", "|---|---|---|:-:|", ...rows].join("\n");
}

const STAGES = [
  ["א׳", "15", "Express 5 + Zod, repository בזיכרון"],
  ["ב׳", "19", "PostgreSQL + Prisma, סינון ומיון במסד"],
  ["ג׳", "20", "NestJS + Swagger — אותו API בדיוק"],
  ["ד׳", "21", "משתמשים, JWT, refresh tokens, תפקידים; כל אחד רואה רק את שלו"],
  ["ה׳", "22", "בדיקות: unit, e2e ו־integration עם Jest ו־supertest"],
  ["ו׳", "23", "Dockerfile ו־Docker Compose — הכול עולה בפקודה אחת"],
  ["ז׳", "24", "לוגים עם request ID, אזורי זמן, Idempotency-Key, הגבלת קצב"],
  ["ח׳", "25", "CI ופריסה — קישור חי"],
];
const builtNums = new Set(chapters.map((c) => String(c.num)));
const stagesTable = [
  "| שלב | פרק | מה נוסף | |",
  "|:-:|:-:|---|:-:|",
  ...STAGES.map(([st, num, what]) => `| ${st} | ${num} | ${what} | ${builtNums.has(num) ? "✔" : "בתוכנית"} |`),
].join("\n");

// ---------- README ----------
const md = `<!-- נוצר אוטומטית: node course-src/scripts/make-readme.mjs — לא לערוך ביד -->
<p align="center">
  <img src="docs/readme/banner.svg" alt="קורס Backend בעברית — מאפס ועד משרת Junior" width="100%">
</p>

${rtl(`
<p align="center">
  <b><a href="https://yeudaba.github.io/backend-course-he/">לקריאת הקורס באתר</a></b>
  &nbsp;·&nbsp; <a href="#התחלה-מהירה">התחלה מהירה</a>
  &nbsp;·&nbsp; <a href="#תוכן-הקורס">תוכן הקורס</a>
  &nbsp;·&nbsp; <a href="#פרויקט-2--הפרויקט-שגדל">פרויקט 2</a>
</p>

## על הקורס

קורס Backend שלם בעברית, ללמידה עצמית: מ"מה זה משתנה" ועד שרת **NestJS** מאובטח מעל **PostgreSQL**, שרץ ב־Docker — ובסופו פרויקט דגל לתיק העבודות. המטרה אחת: **משרת Junior Backend**.

הקורס נבנה ללומד אחד ספציפי — בוגר הנדסת תוכנה שזוכר את המושגים אבל לא את התחביר, ועובד על Mac עם VS Code. לכן כל פרק מתחיל במה שצריך להתקין, וכל שיעור מסביר "למה" לפני "איך".

| פרקים ופרויקטים | שיעורים | תרגילים | בדיקות אוטומטיות | דוגמאות שרצות באימות |
|:-:|:-:|:-:|:-:|:-:|
| **${stats.units}** | **${stats.lessons}** | **${stats.exercises}** | **${stats.tests}** | **${stats.runs}** |

## מה שונה כאן

**הכול נבדק בהרצה.** כל דוגמת קוד בשיעור רצה בזמן הבנייה, והפלט שלה חייב להיות זהה למה שכתוב בשיעור. כל בדיקה אוטומטית חייבת לעבור על הפתרון — ולהיכשל על קובץ ההתחלה. שאילתות SQL רצות מול PostgreSQL 18 אמיתי, ובדיקות Docker בונות ומריצות קונטיינרים.

**25 תרגילים בכל פרק, בחמש רמות** — הבנה (E01–E05), כתיבה (E06–E12), שילוב (E13–E19), תיקון באגים בקוד אמיתי (E20–E23), ואתגר (E24–E25). לכל תרגיל שני רמזים, פתרון מוסבר וטעויות נפוצות, בדף נפרד.

**מפרק 22 הלומד כותב בדיקות בעצמו** — והבודק מכניס באגים לקוד (mutation testing) ומוודא שהבדיקות תופסות אותם.

**עברית פשוטה, מונחים באנגלית.** מילון עם הגייה, איור בכל שיעור (מותאם למצב כהה), וקופסת "לפני שמתחילים" בכל פרק.

## מפת הדרך

${progressTable()}
`)}

${rtl(`
## תוכן הקורס

${parts.map((part) => `### ${part}

${partTable(part)}
${chapters.some((c) => c.part === part) ? `
<details>
<summary><b>כל השיעורים בחטיבה</b></summary>

${lessonsList(part)}

</details>
` : ""}`).join("\n")}
`)}

${rtl(`
## פרויקט 2 — "הפרויקט שגדל"

אותו \`tasks-api\` עובר שמונה גלגולים לאורך הקורס — מ־Express עם מערך בזיכרון ועד שרת NestJS שרץ בענן, עם CI/CD וקישור חי. בכל שלב נוסף משהו, וה־API החיצוני נשאר זהה. כך רואים בפועל למה בונים בשכבות.

${stagesTable}

### הארכיטקטורה היום (שלב ח׳)

בקשה עוברת מלמעלה למטה. כל שכבה יכולה לעצור אותה עם שגיאה אחידה — \`{ error: { code, message } }\`.
`)}

\`\`\`mermaid
flowchart TB
  C(["דפדפן · REST Client · Swagger"]) --> M["request ID + לוג JSON<br/>AsyncLocalStorage"]
  M --> RL["הגבלת קצב — 429<br/>רק login ו־register"]
  M --> G["JwtAuthGuard — 401<br/>RolesGuard — 403"]
  G --> V["ZodValidationPipe — 400"]
  V --> CT["Controller"]
  CT --> I["Idempotency-Key<br/>replay · 409 · 422"]
  I --> S["Service<br/>כללים עסקיים · היום לפי אזור הזמן"]
  S --> R["Repository<br/>WHERE owner_id"]
  R --> DB[("PostgreSQL 18<br/>users · tasks · refresh_tokens · idempotency_keys")]
\`\`\`

${rtl(`
## התחלה מהירה

### ללומד

מורידים, מעתיקים את חומרי הקורס לתיקיית עבודה, ומתקינים:
`)}

\`\`\`bash
git clone https://github.com/${REPO}.git ~/Desktop/Backend
mkdir -p ~/dev && cp -R ~/Desktop/Backend/backend-course ~/dev/backend-course
cd ~/dev/backend-course && npm install
open README.html
\`\`\`

${rtl(`
פותרים בקובצי ההתחלה (תיקיית \`starter\`) של כל פרק, ובודקים עם \`npm run check\`:

| מה בודקים | פקודה |
|---|---|
| תרגיל אחד | \`npm run check P24-E06\` |
| כל הפרק | \`npm run check P24\` |
| הפרויקט | \`npm run check PR2-PROD -- --dir ~/dev/tasks-api\` |
`)}

${rtl(`
### למפתח

הקוד של הקורס נמצא ב־\`course-src\`, ו־\`backend-course\` נבנה ממנו. אימות מריץ כל דוגמה וכל בדיקה, ולכן צריך Node 24 ו־PostgreSQL. בענן או בלינוקס, \`cloud-setup.sh\` מעלה את PostgreSQL 18 ב־Docker ומתקין את Node 24:
`)}

\`\`\`bash
cd course-src && npm ci && cd ..
bash course-src/scripts/cloud-setup.sh
export PATH=/opt/node24/bin:$PATH
\`\`\`

${rtl(`
| מה | פקודה |
|---|---|
| לבנות ולאמת פרק אחד | \`node course-src/build.mjs --verify 24\` |
| לבנות ולאמת הכול | \`node course-src/build.mjs --verify\` |
| לעדכן את ה־README | \`node course-src/scripts/make-readme.mjs\` |

## מבנה המאגר

| תיקייה או קובץ | מה יש בו |
|---|---|
| \`backend-course\` | מה שהלומד מקבל: דפי HTML, קובצי התחלה, פתרונות, בדיקות והבודק |
| \`course-src/chapters\` | המקור — תיקייה לכל פרק: שיעורים, תרגילים, בדיקות ופתרונות. **כאן עורכים** |
| \`course-src/build.mjs\` | בונה את \`backend-course\` ומאמת כל דוגמה ובדיקה |
| \`course-src/root\` | מועתק לשורש \`backend-course\`: \`package.json\` והבודק |
| \`course-src/scripts\` | \`cloud-setup.sh\`, \`make-readme.mjs\` |
| \`HANDOFF_המשך_הפרויקט.md\` | מצב הפרויקט וכל הגילויים הטכניים מהדרך |
| \`אפיון_קורס_Backend_v2.md\` | האפיון של הקורס |
`)}

${rtl(`
## הטכנולוגיות

| תחום | כלים |
|---|---|
| שפה | JavaScript · TypeScript · Node.js 24 |
| שרת | Express 5 · NestJS 12 · Zod 4 · Swagger |
| מסד נתונים | PostgreSQL 18 · SQL · Prisma 7 |
| אבטחה | bcrypt · JWT · refresh tokens · הגבלת קצב · OWASP API Top 10 |
| בדיקות | node:test · Jest · supertest · mutation testing |
| תשתית | Linux · bash · Docker · Docker Compose · nginx |
| פרודקשן | לוגים מובנים · request ID · אזורי זמן · Idempotency-Key · graceful shutdown |
| CI/CD | GitHub Actions · Render · Neon · HTTPS ו־reverse proxy · בדיקת עשן |

---

<p align="center"><sub>נבנה פרק אחר פרק. כל פלט בו נבדק בהרצה אמיתית.</sub></p>
`)}
`;

fs.writeFileSync(path.join(ROOT, "README.md"), md);
console.log(`✔ README.md — ${stats.units} יחידות, ${stats.lessons} שיעורים, ${stats.exercises} תרגילים, ${stats.tests} בדיקות, ${stats.runs} דוגמאות`);
