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
  "18-consistency": "⚖️", "19-prisma": "🔺", "20-nestjs": "🐈", "21-auth": "🔐",
};

// מה שעוד לא נבנה — לפי האפיון (אפיון_קורס_Backend_v2.md, סעיף 8)
const PLANNED = [
  { part: "חטיבה ד׳ — רמת תעשייה", label: "פרק 22", icon: "🧪", title: "בדיקות", topics: "unit, integration, e2e, mocks, מסד בדיקות" },
  { part: "חטיבה ד׳ — רמת תעשייה", label: "פרק 23", icon: "🐳", title: "Linux ו־Docker", topics: "Dockerfile, Compose, volumes — הכול עולה בפקודה אחת" },
  { part: "חטיבה ד׳ — רמת תעשייה", label: "פרק 24", icon: "🏭", title: "API של מוצר אמיתי", topics: "logs, request ID, אזורי זמן, idempotency, rate limit" },
  { part: "חטיבה ד׳ — רמת תעשייה", label: "פרק 25", icon: "🚀", title: "CI ופריסה", topics: "GitHub Actions, secrets, healthcheck, HTTPS — קישור חי" },
  { part: "חטיבה ד׳ — רמת תעשייה", label: "פרויקט 3", icon: "☕", title: "פרויקט הדגל: חנות ציוד קפה", topics: "JWT, עגלה←הזמנה, transactions, idempotency, Docker, CI" },
  { part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרק 26", icon: "⚡", title: "Cache ותורים", topics: "Redis דרך Docker" },
  { part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרק 27", icon: "🧠", title: "אלגוריתמים וראיונות", topics: "שאלות ראיון, סיבוכיות" },
  { part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרק 28", icon: "🏗️", title: "תכנון מערכת", topics: "רשות, ברמת Junior" },
  { part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרק 29", icon: "🤖", title: "AI ב־Backend", topics: "רשות" },
  { part: "חטיבה ה׳ — ראיונות והרחבות", label: "פרק 30", icon: "💼", title: "תיק עבודות וחיפוש עבודה", topics: "GitHub, קורות חיים, LinkedIn, סימולציות ראיון" },
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

// ---------- Mermaid ----------
const mid = (s) => "n" + s.replace(/[^\w]/g, "_");
const short = (t) => t.replace(/"/g, "'").replace(/:.*$/, "");
const PART_ICONS = ["🟨", "🔷", "🗄️", "🏭", "💼"];
function roadmap() {
  const lines = ["flowchart LR"];
  parts.forEach((part, i) => {
    const done = chapters.filter((c) => c.part === part);
    const planned = PLANNED.filter((p) => p.part === part);
    const [name, rawSub] = part.split(" — ");
    const sub = rawSub.replace(/ ו־(?=[A-Za-z])/g, " + "); // "ו־Node.js" מתבלגן בכיווניות בתוך Mermaid
    // מספרים בלבד (קצר ויציב בכיווניות); פרויקטים — בשורה משלהם
    const num = (label) => label.replace(/^(פרק|יחידה) /, "");
    const isProj = (label) => label.startsWith("פרויקט");
    const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, k) => arr.slice(k * n, k * n + n).join(" · "));
    const rows = [];
    const doneNums = done.filter((c) => !isProj(c.label)).map((c) => num(c.label));
    const plannedNums = planned.filter((p) => !isProj(p.label)).map((p) => num(p.label));
    if (doneNums.length) rows.push(...chunk(doneNums, 5).map((r) => `✅ ${r}`));
    if (plannedNums.length) rows.push(...chunk(plannedNums, 5).map((r) => `▫️ ${r}`));
    for (const c of done.filter((c) => isProj(c.label))) rows.push(`🏗️ ${c.label} ✅`);
    for (const p of planned.filter((p) => isProj(p.label))) rows.push(`🏗️ ${p.label} ▫️`);
    const rowsOf3 = rows;
    const total = done.length + planned.length;
    const cls = done.length === total ? "done" : done.length === 0 ? "planned" : "progress";
    lines.push(`  P${i}["${PART_ICONS[i] ?? "📘"} <b>${name}</b><br/>${sub}<br/><br/>${rowsOf3.join("<br/>")}<br/><br/><b>${done.length}/${total}</b>"]:::${cls}`);
  });
  for (let i = 1; i < parts.length; i++) lines.push(`  P${i - 1} --> P${i}`);
  lines.push(
    "  classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px",
    "  classDef progress fill:#fef9c3,stroke:#ca8a04,color:#713f12,stroke-width:2px",
    "  classDef planned fill:#f1f5f9,stroke:#94a3b8,color:#475569,stroke-dasharray: 5 5",
  );
  return lines.join("\n");
}

// ---------- טבלאות ----------
function partTable(part) {
  const rows = chapters.filter((c) => c.part === part).map((c) => {
    const link = `[${c.label}](backend-course/${c.slug}/index.html)`;
    const fast = c.fast ? " ⚡" : "";
    return `| ${c.icon} | ${link}${fast} | **${c.title}** | ${c.lessons.length} | ${c.exercises || "—"} | ${c.tests ? `🤖 ${c.tests}` : "—"} | ✅ |`;
  });
  const planned = PLANNED.filter((p) => p.part === part).map((p) => `| ${p.icon} | ${p.label} | **${p.title}** <br><sub>${p.topics}</sub> | | | | 🗓️ |`);
  return ["| | | נושא | שיעורים | תרגילים | בדיקות | מצב |", "|:-:|---|---|:-:|:-:|:-:|:-:|", ...rows, ...planned].join("\n");
}

function lessonsList(part) {
  const items = chapters.filter((c) => c.part === part).map((c) => {
    const ls = c.lessons.map((l, i) => `${i + 1}. ${l.title}${l.note ? ` <sub>${l.note}</sub>` : ""}`).join("<br>");
    return `| ${c.icon} **${c.label}** | ${ls} |`;
  });
  return ["| | השיעורים |", "|---|---|", ...items].join("\n");
}

const badge = (label, msg, color, logo) =>
  `<img alt="${label} ${msg}" src="https://img.shields.io/badge/${encodeURIComponent(label)}-${encodeURIComponent(msg)}-${color}?style=for-the-badge${logo ? `&logo=${logo}&logoColor=white` : ""}">`;

// ---------- README ----------
const md = `<!-- נוצר אוטומטית: node course-src/scripts/make-readme.mjs — לא לערוך ביד -->
<p align="center">
  <img src="docs/readme/banner.svg" alt="קורס Backend בעברית — מאפס ועד משרת Junior" width="100%">
</p>

<p align="center">
  ${badge("Node.js", "24", "339933", "nodedotjs")}
  ${badge("TypeScript", "5", "3178C6", "typescript")}
  ${badge("Express", "5", "000000", "express")}
  ${badge("Zod", "4", "3E67B1", "zod")}
  ${badge("PostgreSQL", "18", "4169E1", "postgresql")}
  ${badge("Prisma", "7", "2D3748", "prisma")}
  ${badge("NestJS", "12", "E0234E", "nestjs")}
  ${badge("JWT", "auth", "000000", "jsonwebtokens")}
</p>

<p align="center">
  <a href="https://yeudaba.github.io/backend-course-he/"><img alt="לקריאה באתר" src="https://img.shields.io/badge/📖_לקריאה_באתר-GitHub_Pages-7c3aed?style=flat-square"></a>
  <img alt="verified" src="https://img.shields.io/badge/כל_הדוגמאות-מאומתות_בהרצה-16a34a?style=flat-square">
  <img alt="language" src="https://img.shields.io/badge/שפה-עברית-0ea5e9?style=flat-square">
</p>

<div align="center">

| 📚 פרקים ופרויקטים מוכנים | 🎓 שיעורים | ✍️ תרגילים | 🤖 קובצי בדיקה | ▶️ דוגמאות שרצות באימות |
|:-:|:-:|:-:|:-:|:-:|
| **${stats.units}** | **${stats.lessons}** | **${stats.exercises}** | **${stats.tests}** | **${stats.runs}** |

</div>

---

## 🎯 על הקורס

קורס **Backend** שלם בעברית ללמידה עצמית — מ"מה זה משתנה" ועד שרת **NestJS** מאובטח עם **PostgreSQL**, ובסופו פרויקט דגל לתיק העבודות. הוא נבנה ללומד אחד ספציפי (בוגר הנדסת תוכנה שזוכר מושגים אבל לא תחביר, עובד על Mac עם VS Code), והמטרה ברורה: **משרת Junior Backend**.

<table>
<tr>
<td width="50%" valign="top">

### ✨ מה מיוחד
- 🇮🇱 **עברית פשוטה**, מונחים באנגלית, ומילון עם הגייה
- 🧰 **קופסת "לפני שמתחילים"** בכל פרק — מה להתקין ב־Mac, וקישורים רשמיים
- 🎨 **איור SVG בכל שיעור** — מותאם למצב כהה ולימין־לשמאל
- ✍️ **25 תרגילים בכל פרק**, ב־5 רמות
- 🔍 **דף פתרונות נפרד** — עם "למה" ו"טעויות נפוצות"

</td>
<td width="50%" valign="top">

### 🔬 איך מבטיחים שזה נכון
- ▶️ **כל דוגמה רצה** בזמן הבנייה, והפלט חייב להיות זהה למה שכתוב בשיעור
- 🤖 **כל בדיקה** חייבת לעבור על הפתרון — **ולהיכשל** על קובץ ההתחלה
- 🗄️ **SQL מול PostgreSQL 18 אמיתי**, כולל מרוצים עם שני חיבורים
- 🌐 **CORS ודפי HTML** נבדקים בדפדפן אמיתי
- 🧾 אף פלט או הודעת שגיאה לא "הומצאו"

</td>
</tr>
</table>

### 📈 חמש רמות בכל פרק

| רמה | תרגילים | סוג | |
|:-:|:-:|---|:-:|
| 1 | E01–E05 | 🧠 הבנה וקריאת קוד | |
| 2 | E06–E12 | ✏️ כתיבה בסיסית | 🤖 |
| 3 | E13–E19 | 🧩 שילוב כמה נושאים | 🤖 |
| 4 | E20–E23 | 🐛 **תיקון באגים** — קובץ ההתחלה מכיל תקלות אמיתיות | 🤖 |
| 5 | E24–E25 | 🏆 אתגר | 🤖 |

---

## 🗺️ מפת הדרך

> 🟩 חטיבה מוכנה &nbsp;·&nbsp; 🟨 בעבודה &nbsp;·&nbsp; ⬜ בתוכנית &nbsp;·&nbsp; ✅ פרקים מוכנים &nbsp;·&nbsp; ▫️ פרקים בתוכנית &nbsp;·&nbsp; המספרים — מספרי הפרקים

\`\`\`mermaid
${roadmap()}
\`\`\`

---

## 📚 תוכן הקורס

${parts.map((part) => `### ${part}

${partTable(part)}
${chapters.some((c) => c.part === part) ? `
<details>
<summary>📖 <b>כל השיעורים בחטיבה</b></summary>

${lessonsList(part)}

</details>
` : ""}`).join("\n")}

---

## 🏗️ פרויקט 2 — "הפרויקט שגדל"

אותו \`tasks-api\` עובר גלגולים לאורך הקורס, ובכל אחד מהם **ה־API החיצוני נשאר זהה** — כך רואים בעצמך למה בונים בשכבות.

\`\`\`mermaid
flowchart LR
  A["🟢 שלב א׳ · פרק 15<br/>Express 5 + Zod<br/>repository בזיכרון"]:::done --> B["🗄️ שלב ב׳ · פרק 19<br/>PostgreSQL + Prisma<br/>סינון ומיון במסד"]:::done
  B --> C["🐈 שלב ג׳ · פרק 20<br/>NestJS + Swagger<br/>אותו API בדיוק"]:::done
  C --> D["🔐 שלב ד׳ · פרק 21<br/>משתמשים, JWT, roles<br/>כל אחד רואה רק את שלו"]:::done
  D --> E["🧪🐳🚀 פרקים 22–25<br/>בדיקות · Docker · CI<br/>קישור חי"]:::planned
  classDef done fill:#dcfce7,stroke:#16a34a,color:#14532d
  classDef planned fill:#f1f5f9,stroke:#94a3b8,color:#475569,stroke-dasharray: 5 5
\`\`\`

### הארכיטקטורה (שלב ד׳)

\`\`\`mermaid
flowchart LR
  Client(["🌐 דף HTML / REST Client / Swagger"]) -->|"Authorization: Bearer"| G1
  subgraph Nest["NestJS — tasks-api"]
    direction LR
    G1["🛡️ JwtAuthGuard<br/>401"] --> G2["👮 RolesGuard<br/>403"] --> P["🧪 ZodValidationPipe<br/>400"] --> C["🎮 Controller<br/>@CurrentUser()"] --> S["⚙️ Service<br/>כללים עסקיים"] --> R["📦 Repository<br/>WHERE owner_id"]
    F["🧯 HttpErrorFilter<br/>{ error: { code, message } }"]
  end
  R --> DB[("🐘 PostgreSQL<br/>users · tasks · refresh_tokens")]
  G1 -.-> F
  P -.-> F
  S -.-> F
\`\`\`

<details>
<summary>🔌 <b>ה־endpoints של שלב ד׳</b></summary>

| בקשה | מי | תשובה |
|---|---|---|
| \`POST /auth/register\` | כולם | 201 משתמש (בלי hash) · 409 \`EMAIL_TAKEN\` |
| \`POST /auth/login\` | כולם | access (15 דק׳) + refresh (7 ימים) · 401 \`INVALID_CREDENTIALS\` |
| \`POST /auth/refresh\` | כולם | זוג חדש (rotation + זיהוי שימוש חוזר) |
| \`POST /auth/logout\` | כולם | 204 |
| \`GET /auth/me\` | מחובר | המשתמש |
| \`GET/POST/PATCH/DELETE /tasks\` | מחובר | רק המשימות **שלו** · של אחר ← 404 |
| \`GET /tasks/stats\` | מחובר | סטטיסטיקה אישית |
| \`GET /users\` | admin | כל המשתמשים · 403 \`FORBIDDEN\` |
| \`GET /health\`, \`/docs\` | כולם | בריאות, Swagger |

</details>

### 💼 שלושת הפרויקטים

| | פרויקט | מה | מצב |
|:-:|---|---|:-:|
| 💰 | **פרויקט 1** — מנהל הוצאות CLI | JavaScript, קבצים, ארגון קוד ובדיקות | ✅ |
| ✅ | **פרויקט 2** — tasks-api | Express ← Prisma ← NestJS ← Auth ← בדיקות ← Docker ← פריסה | 🔄 שלב ד׳ מתוך ה׳ |
| ☕ | **פרויקט 3** — חנות ציוד קפה (הדגל) | נבנה מאפס: עגלה←הזמנה, מלאי ב־transaction, idempotency, תשלום מדומה, CI וקישור חי | 🗓️ |

---

## ⚙️ איך הקורס בנוי (למפתח)

\`\`\`mermaid
flowchart LR
  subgraph SRC["📝 course-src — המקור"]
    direction TB
    CH["chapters · פרק לכל תיקייה<br/>chapter.mjs · lesson-*.html<br/>exercises.txt · starter/ · tests/"]
    ROOTF["root<br/>package.json · tools · הבודק"]
  end
  CH --> B{{"🔨 build.mjs"}}
  ROOTF --> B
  B --> OUT["📦 backend-course<br/>מה שהלומד מקבל:<br/>HTML · starter · solutions · tests"]
  B -.->|"--verify"| V1["▶️ מריץ כל דוגמה<br/>ומשווה פלט"]
  B -.->|"--verify"| V2["🤖 בדיקות: עוברות על הפתרון<br/>ונכשלות על ההתחלה"]
  V1 --> PG[("🐘 PostgreSQL 18<br/>פורט 5433")]
  V2 --> PG
\`\`\`

\`\`\`text
.
├── 📄 README.md                    ← המסמך הזה (נוצר מ־course-src/scripts/make-readme.mjs)
├── 📄 HANDOFF_המשך_הפרויקט.md      ← מצב מלא של הפרויקט + "גילויים" טכניים
├── 📄 אפיון_קורס_Backend_v2.md      ← האפיון המאושר
├── 🖼️ docs/readme/                  ← תמונות ל־README
├── 📦 backend-course/              ← ★ מה שהלומד מקבל (נבנה אוטומטית, חוץ מ־00-setup)
│   ├── README.html · glossary.html · assets/
│   ├── 00-setup/ … ${chapters.at(-1).slug}/
│   └── tools/                      ← הבודק: check · load · sql · nest · reporter
└── 📝 course-src/                  ← ★ המקור — כאן עורכים
    ├── build.mjs                   ← בנייה + אימות
    ├── chapters/<slug>/            ← פרק לכל תיקייה
    ├── root/                       ← מועתק לשורש backend-course
    └── scripts/                    ← cloud-setup.sh · make-readme.mjs · make-reference-pr2.py
\`\`\`

---

## 🚀 התחלה מהירה

<table>
<tr>
<td width="50%" valign="top">

### 🎓 ללומד

\`\`\`bash
git clone https://github.com/${REPO}.git
cp -R backend-course-he/backend-course ~/dev/backend-course
cd ~/dev/backend-course && npm install
open README.html
\`\`\`

פותרים בקובצי \`starter/\`, ובודקים:

\`\`\`bash
npm run check P21-E06     # תרגיל אחד
npm run check P21         # כל הפרק
npm run check PR2-AUTH -- --dir ~/dev/tasks-api
\`\`\`

</td>
<td width="50%" valign="top">

### 🛠️ למפתח

\`\`\`bash
cd course-src && npm ci && cd ..
# בענן/לינוקס (PostgreSQL ב־Docker):
bash course-src/scripts/cloud-setup.sh
\`\`\`

\`\`\`bash
node course-src/build.mjs --verify 21   # פרק אחד
node course-src/build.mjs --verify      # הכול
node course-src/build.mjs --fill 22     # ממלא פלטים אמיתיים
node course-src/scripts/make-readme.mjs # README מעודכן
\`\`\`

</td>
</tr>
</table>

---

## 🧱 הסטאק

| | שכבה | כלים |
|:-:|---|---|
| 🟨 | שפה | JavaScript · TypeScript 5 · Node.js 24 |
| 🌐 | שרת | Express 5 · NestJS 12 · Zod 4 · class-validator · Swagger |
| 🗄️ | מסד נתונים | PostgreSQL 18 · SQL · Prisma 7 (\`@prisma/adapter-pg\`) |
| 🔐 | אבטחה | bcryptjs · JWT (\`@nestjs/jwt\`) · refresh tokens · OWASP API Top 10 |
| 🧪 | בדיקות | \`node:test\` · בודק אוטומטי בעברית · Jest (בפרויקט Nest) |
| 🐳 | תשתית (בהמשך) | Docker · Compose · GitHub Actions · Redis |

---

<p align="center">
  <sub>נבנה פרק אחר פרק, וכל פלט בו נבדק בהרצה אמיתית · 🇮🇱 עברית · ${new Date().getFullYear()}</sub>
</p>
`;

fs.writeFileSync(path.join(ROOT, "README.md"), md);
console.log(`✔ README.md — ${stats.units} יחידות, ${stats.lessons} שיעורים, ${stats.exercises} תרגילים, ${stats.tests} בדיקות, ${stats.runs} דוגמאות`);
