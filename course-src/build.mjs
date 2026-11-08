// בונה את דפי הקורס מתוך course-src/chapters אל backend-course/
// שימוש: node course-src/build.mjs [--verify] [chapter-prefix...]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SRC, "..");
const OUT = path.join(ROOT, "backend-course");
const args = process.argv.slice(2);
const FILL = args.includes("--fill"); // ```out עם "?" בלבד ← ממלא את הפלט האמיתי בקובץ המקור
const VERIFY = args.includes("--verify") || FILL;
const fills = new Map(); // קוד הדוגמה ← הפלט שהתקבל
const only = args.filter((a) => !a.startsWith("--"));

const problems = [];
let runCount = 0;
let currentOutDir = null;
const lbl = (ch) => ch.label ?? `פרק ${ch.num}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- PostgreSQL לאימות (פורט 5433, משתמש postgres, בלי סיסמה, אזור זמן Asia/Jerusalem) ----------
// במק: שרת פרטי בבינאריים של EDB עם נתונים ב־course-src/.pgdata.
// בענן/לינוקס: קונטיינר Docker בשם course-pg (postgres:18), ו־psql 18 ב־/opt/pg18/bin (ראה scripts/cloud-setup.sh).
// אפשר לדרוס עם PG_BIN=<תיקייה שיש בה psql ו־pg_isready>.
const PG_ENV = { PGHOST: "localhost", PGPORT: "5433", PGUSER: "postgres", PGDATABASE: "postgres" };
const PG_BIN = process.env.PG_BIN ?? ["/Library/PostgreSQL/18/bin", "/opt/pg18/bin"].find((d) => fs.existsSync(path.join(d, "psql"))) ?? "/Library/PostgreSQL/18/bin";
let pgReady = false;
function ensurePg() {
  if (pgReady) return;
  const ping = () => spawnSync(path.join(PG_BIN, "pg_isready"), ["-h", "localhost", "-p", "5433"]).status === 0;
  const waitPing = () => { for (let i = 0; i < 60 && !ping(); i++) spawnSync("sleep", ["0.5"]); return ping(); };
  if (!ping()) {
    if (fs.existsSync(path.join(PG_BIN, "pg_ctl")) && fs.existsSync(path.join(SRC, ".pgdata"))) {
      spawnSync(path.join(PG_BIN, "pg_ctl"), ["-D", path.join(SRC, ".pgdata"), "-o", "-p 5433 -k /tmp -c listen_addresses=localhost", "-l", path.join(SRC, ".pgdata", "server.log"), "-w", "start"], { stdio: "ignore" });
    } else if (spawnSync("docker", ["start", "course-pg"], { stdio: "ignore" }).status !== 0) {
      spawnSync("docker", ["run", "-d", "--name", "course-pg", "-p", "5433:5432", "-e", "POSTGRES_HOST_AUTH_METHOD=trust", "-e", "TZ=Asia/Jerusalem", "postgres:18", "-c", "timezone=Asia/Jerusalem"], { stdio: "ignore" });
    }
  }
  if (!waitPing()) throw new Error("שרת PostgreSQL לאימות לא עלה על פורט 5433 (course-src/.pgdata או קונטיינר course-pg)");
  pgReady = true;
}
function psql(args, { file, schema, input, keepGoing = false, merge = false } = {}) {
  const cmd = path.join(PG_BIN, "psql");
  const argv = ["-X", "-P", "pager=off", ...(keepGoing ? [] : ["-v", "ON_ERROR_STOP=1"]), ...args, ...(file ? ["-f", file] : [])];
  const env = { ...process.env, ...PG_ENV, ...(schema ? { PGOPTIONS: `-c search_path=${schema}` } : {}) };
  if (!merge) return spawnSync(cmd, argv, { encoding: "utf8", input, env });
  // merge: stdout ו־stderr לאותו קובץ — כדי ששגיאות יופיעו במקום שבו קרו, כמו בטרמינל
  const outFile = path.join(SRC, ".run", `psql-${process.pid}-${runCount}.out`);
  const fd = fs.openSync(outFile, "w");
  const r = spawnSync(cmd, argv, { env, stdio: ["ignore", fd, fd] });
  fs.closeSync(fd);
  return { status: r.status, stdout: fs.readFileSync(outFile, "utf8"), stderr: "" };
}

// ---------- עיבוד טקסט: גדרות קוד וקוד בתוך שורה ----------
function renderFences(src, ctx) {
  const parts = [];
  const re = /^```(\w+)([^\n]*)\n([\s\S]*?)^```[ \t]*$/gm;
  let last = 0;
  let m;
  let pendingRun = null;
  while ((m = re.exec(src))) {
    parts.push({ html: inline(src.slice(last, m.index)) });
    const [, lang, rawAttrs, body0] = m;
    const body = body0.replace(/\n$/, "");
    const attrs = Object.fromEntries(
      [...rawAttrs.matchAll(/(\w+)(?:=("[^"]*"|\S+))?/g)].map(([, k, v]) => [k, v ? v.replace(/^"|"$/g, "") : true])
    );
    let html = "";
    if (lang === "term") {
      html = `<pre class="terminal">${body
        .split("\n")
        .map((l) => {
          if (l.startsWith("% ")) return `<span class="prompt">% </span>${esc(l.slice(2))}`;
          if (l.startsWith("!! ")) return `<span class="err">${esc(l.slice(3))}</span>`;
          if (l.startsWith(".. ")) return `<span class="dim">${esc(l.slice(3))}</span>`;
          return esc(l);
        })
        .join("\n")}</pre>`;
    } else if (lang === "out") {
      html = `<pre class="terminal">${esc(body)}</pre>`;
      if (pendingRun && VERIFY) checkRun(pendingRun, body, ctx);
      pendingRun = null;
    } else {
      const label = attrs.file ? `<span class="file-label">${esc(attrs.file)}</span>\n` : "";
      html = `${label}<pre><code class="lang-${lang}">${esc(body)}</code></pre>`;
      if (attrs.run || attrs.tsc) pendingRun = { lang, code: body, attrs };
      if (attrs.save && currentOutDir) {
        const target = path.join(currentOutDir, attrs.save);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, body + "\n");
      }
    }
    parts.push({ html });
    last = re.lastIndex;
  }
  parts.push({ html: inline(src.slice(last)) });
  if (pendingRun && VERIFY) checkRun(pendingRun, null, ctx);
  return parts.map((p) => p.html).join("");
}

function inline(text) {
  // `קוד` → <code>, מחוץ לתגיות svg/pre שנכתבו ידנית
  return text.replace(/(<svg[\s\S]*?<\/svg>|<pre[\s\S]*?<\/pre>)|`([^`\n]+)`/g, (all, keep, code) =>
    keep ? keep : `<code>${esc(code)}</code>`
  );
}

function checkRun(run, expected, ctx) {
  runCount++;
  // בתוך course-src, כדי שדוגמאות עם import "express" ימצאו את node_modules שלו
  fs.mkdirSync(path.join(SRC, ".run"), { recursive: true });
  const dir = fs.mkdtempSync(path.join(SRC, ".run", "run-"));
  const ext = run.lang === "ts" ? ".ts" : run.lang === "sql" ? ".sql" : run.lang === "bash" ? ".sh" : run.attrs.mjs ? ".mjs" : ".js";
  const file = path.join(dir, "snippet" + ext);
  fs.writeFileSync(file, run.code);
  const nodeArgs = run.lang === "ts" ? ["--experimental-strip-types", "--no-warnings", file] : [file];
  let r;
  if (run.lang === "sql" && run.attrs.mysql) {
    // יחידה 19.5: SQL מול MySQL 8.4 (הקונטיינר course-mysql, ראה scripts/cloud-setup.sh), database נקי לכל דוגמה.
    // הפלט — כמו ב־mysql CLI עם --table
    const mysqlCli = (args, input) => spawnSync("docker", ["exec", "-i", "course-mysql", "mysql", "-uroot", "--default-character-set=utf8mb4", ...args], { encoding: "utf8", input });
    mysqlCli(["-e", "DROP DATABASE IF EXISTS snippet; CREATE DATABASE snippet CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci"]);
    if (run.attrs.db) {
      const seed = mysqlCli(["-D", "snippet"], fs.readFileSync(path.join(SRC, "chapters", run.attrs.db), "utf8"));
      if (seed.status !== 0) problems.push(`${ctx}: טעינת ${run.attrs.db} ל־MySQL נכשלה\n${seed.stderr}`);
    }
    if (run.attrs.stderr) {
      // שגיאות בסדר שבו קרו, בין התוצאות (כמו שהלומד רואה בטרמינל)
      r = spawnSync("docker", ["exec", "-i", "course-mysql", "sh", "-c", `mysql -uroot --default-character-set=utf8mb4 --table --unbuffered -D snippet ${run.attrs.continue ? "--force" : ""} 2>&1`], { encoding: "utf8", input: run.code });
      r.stdout = r.stdout.replace(/^ERROR (\d+) \((\w+)\) at line \d+: /gm, "ERROR $1 ($2): ");
      r.stderr = "";
    } else {
      // raw: בלי מסגרת טבלה ובלי כותרות — ל־EXPLAIN FORMAT=TREE ולפלט רב־שורות
      const format = run.attrs.raw ? ["--batch", "--raw", "--skip-column-names"] : ["--table"];
      r = mysqlCli([...format, "-D", "snippet", ...(run.attrs.continue ? ["--force"] : [])], run.code);
    }
  } else if (run.lang === "sql") {
    ensurePg();
    psql(["-q", "-c", "DROP SCHEMA IF EXISTS snippet CASCADE; CREATE SCHEMA snippet;"]);
    if (run.attrs.db) {
      const seed = psql(["-q"], { file: path.join(SRC, "chapters", run.attrs.db), schema: "snippet" });
      if (seed.status !== 0) problems.push(`${ctx}: טעינת ${run.attrs.db} נכשלה\n${seed.stderr}`);
    }
    r = psql([], { file, schema: "snippet", keepGoing: Boolean(run.attrs.continue), merge: Boolean(run.attrs.stderr) }); // continue: להמשיך אחרי שגיאה
    r.stdout = r.stdout.replace(/^psql:[^:]+:\d+: /gm, ""); // כמו שהלומד יראה ב־psql אינטראקטיבי
    r.stderr = r.stderr.replace(/^psql:[^:]+:\d+: /gm, "");
  } else if (run.lang === "bash") {
    // פרק 23: פקודות shell. בתיקייה זמנית ריקה, עם locale קבוע (סדר מיון זהה בכל מחשב)
    r = spawnSync("bash", [file], { encoding: "utf8", cwd: dir, timeout: 15000, env: { ...process.env, LC_ALL: "C" } });
  } else if (run.attrs.tsc) {
    const tsc = path.join(SRC, "node_modules", "typescript", "bin", "tsc");
    r = spawnSync("node", [tsc, "--noEmit", "--strict", "--target", "es2022", "--pretty", "false", "--skipLibCheck", "snippet.ts"], { encoding: "utf8", cwd: dir });
  } else {
    // פרק 26: דוגמאות עם Redis מתחברות ל־REDIS_URL (אצל הלומד — ברירת המחדל, localhost:6379)
    r = spawnSync("node", nodeArgs, { encoding: "utf8", cwd: dir, timeout: 15000, env: { ...process.env, REDIS_URL: "redis://localhost:6380", MYSQL_URL: "mysql://root@localhost:3307", AWS_ENDPOINT_URL: "http://localhost:4566", RABBIT_URL: "amqp://localhost:5673", KAFKA_BROKERS: "localhost:9095" } });
  }
  const norm = (t) => t.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\s+$/, "");
  const got = norm(r.stdout + (run.attrs.stderr ? r.stderr : ""));
  if (FILL && expected !== null && expected.trim() === "?") {
    fills.set(run.code, got);
    return;
  }
  if (expected !== null && got !== norm(expected)) {
    problems.push(`${ctx}: פלט לא תואם\n--- צפוי ---\n${expected}\n--- התקבל ---\n${got}\n${r.stderr}`);
  } else if (expected === null && r.status !== 0 && !run.attrs.fails && !run.attrs.tsc) {
    problems.push(`${ctx}: הדוגמה נכשלה\n${r.stderr}`);
  }
}

// ---------- תבנית דף ----------
function page({ title, depth, crumbs, body }) {
  const up = depth ? "../" : "";
  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${up}assets/style.css">
</head>
<body>
<main>
  <div class="crumbs">${crumbs}</div>
${body}
</main>
</body>
</html>
`;
}

const pager = (prev, next) =>
  `<div class="pager">${prev ? `<a href="${prev.href}"><small>${prev.small}</small>${prev.label}</a>` : "<span></span>"}${
    next ? `<a href="${next.href}"><small>${next.small}</small>${next.label}</a>` : ""
  }</div>`;

// ---------- תרגילים ----------
const LEVELS = { 1: "הבנה", 2: "מודרך", 3: "עצמאי", 4: "תיקון תקלות ושילוב", 5: "אתגר · רשות" };

function parseExercises(text) {
  const list = [];
  let cur = null;
  let field = null;
  for (const line of text.split("\n")) {
    const h = line.match(/^@@ (\S+) \| (\d) \| ([^|]+) \| (\d+) \| (.*)$/);
    if (h) {
      cur = { id: h[1], level: +h[2], title: h[3].trim(), minutes: +h[4], requires: h[5].trim(), task: "", hint1: "", hint2: "", solution: "", mistakes: "" };
      list.push(cur);
      field = "task";
      continue;
    }
    const f = line.match(/^@(task|hint1|hint2|solution|mistakes)\s*$/);
    if (f && cur) {
      field = f[1];
      continue;
    }
    if (cur) cur[field] += line + "\n";
  }
  return list;
}

function exercisesPages(ch, exs, chapterHref) {
  const counts = [1, 2, 3, 4, 5].map((l) => exs.filter((e) => e.level === l).length);
  const total = exs.reduce((s, e) => s + e.minutes, 0);
  const tags = [1, 2, 3, 4, 5].map((l) => `<span class="tag l${l}">${l} · ${LEVELS[l]} (${counts[l - 1]})</span>`).join("\n");
  const intro = `<div class="box goal">
    <span class="box-title">איך עובדים עם הדף</span>
    <ul>
      <li>כל הפקודות נכתבות ב־Terminal של VS Code, מתוך <code>~/dev/backend-course</code>.</li>
      <li>קובצי התחלה: <code>${ch.slug}/starter/</code>. ${ch.checker ? "את רוב התרגילים כותבים <strong>ישירות בקובץ ההתחלה</strong>, ובודקים עם <code>npm run check P" + ch.code + "-E07</code> (לפי מזהה התרגיל)." : "קבצים שאתה יוצר בעצמך — ב־<code>playground/</code>."}</li>
      <li>אין צורך לפתור הכול בישיבה אחת: פתור את התרגילים שמסומנים בשיעור שסיימת, והשלם את השאר בסוף הפרק.</li>
      <li>נתקעת? <a href="solutions.html">דף הפתרונות</a>: רמז 1 ← רמז 2 ← פתרון. <strong>פתח רמז רק אחרי 5–10 דקות של ניסיון אמיתי.</strong></li>
    </ul>
    <p>${tags}</p>
  </div>`;
  const exHtml = exs
    .map(
      (e) => `<div class="ex" id="${e.id}">
    <h3>${e.id} · ${e.title}</h3>
    <div class="ex-meta"><span class="tag l${e.level}">רמה ${e.level}</span><span class="tag">⏱ ${e.minutes} דק׳</span><span class="tag">ידע נדרש: ${e.requires}</span></div>
${renderFences(e.task, `${e.id} task`)}
  </div>`
    )
    .join("\n");
  const exBody = `  <h1>✍️ ${lbl(ch)} — דף תרגילים</h1>
  <p class="subtitle">${exs.length} תרגילים · ⏱ סה״כ כ־${Math.round(total / 60 * 2) / 2} שעות · מומלץ לפצל לכמה מפגשים</p>
${intro}
${exHtml}
  <h2>🏁 מבחן מעבר</h2>
  <div class="box tip">${renderFences(ch.passTest, "pass")}</div>
${pager({ href: "index.html", small: "חזרה", label: `פתיחת ${lbl(ch)}` }, { href: "solutions.html", small: "🔒 רק אחרי ניסיון", label: "דף הפתרונות" })}`;

  const solHtml = exs
    .map((e) => {
      const d = (summary, content) => (content.trim() ? `<details><summary>${summary}</summary><div>\n${renderFences(content, `${e.id} ${summary}`)}\n</div></details>` : "");
      return `<div class="ex" id="${e.id}">
    <h3>${e.id} · ${e.title} <span class="tag l${e.level}">רמה ${e.level}</span></h3>
    ${d("💡 רמז 1", e.hint1)}
    ${d("💡 רמז 2", e.hint2)}
    ${d("✅ פתרון", e.solution)}
    ${d("⚠️ טעויות נפוצות", e.mistakes)}
  </div>`;
    })
    .join("\n");
  const solBody = `  <h1>🔒 ${lbl(ch)} — דף פתרונות</h1>
  <p class="subtitle">כל שכבה מוסתרת. פתח רק את מה שאתה צריך — רמז 1 קודם.</p>
  <div class="box warn"><span class="box-title">לפני שאתה פותח פתרון</span>
  <p>ניסית לפחות 5–10 דקות? קראת שוב את הודעת השגיאה? פתח <strong>רמז 1</strong> בלבד ונסה שוב. קובצי פתרון שאפשר להריץ: <code>${ch.slug}/solutions/</code>.</p></div>
${solHtml}
${pager({ href: "exercises.html", small: "חזרה", label: "דף התרגילים" }, { href: "index.html", small: "", label: `פתיחת ${lbl(ch)}` })}`;
  const crumbs = (last) => `<a href="../README.html">דף הבית</a> ‹ <a href="index.html">${lbl(ch)}</a> ‹ ${last}`;
  return {
    exercises: page({ title: `${lbl(ch)} — תרגילים`, depth: 1, crumbs: crumbs("תרגילים"), body: exBody }),
    solutions: page({ title: `${lbl(ch)} — פתרונות`, depth: 1, crumbs: crumbs("פתרונות"), body: solBody }),
  };
}

// ---------- פרק ----------
async function loadChapters() {
  const dir = path.join(SRC, "chapters");
  const out = [];
  for (const d of fs.readdirSync(dir).sort()) {
    const metaFile = path.join(dir, d, "chapter.mjs");
    if (!fs.existsSync(metaFile)) continue;
    const meta = (await import(pathToFileURL(metaFile).href)).default;
    out.push({ ...meta, slug: d, dir: path.join(dir, d) });
  }
  return out;
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

function buildChapter(ch, prevCh, nextCh) {
  const outDir = path.join(OUT, ch.slug);
  fs.mkdirSync(outDir, { recursive: true });
  currentOutDir = outDir;
  const crumbs = (last) => `<a href="../README.html">דף הבית</a> ‹ <a href="index.html">${lbl(ch)}</a> ‹ ${last}`;
  const lessons = ch.lessons || [];
  const hasEx = fs.existsSync(path.join(ch.dir, "exercises.txt"));

  // שיעורים
  lessons.forEach((l, i) => {
    const src = fs.readFileSync(path.join(ch.dir, l.file), "utf8");
    const body = `  <h1>שיעור ${i + 1} — ${l.title}</h1>
  <p class="subtitle">⏱ ~${l.minutes} דקות${l.note ? " · " + l.note : ""}</p>
${renderFences(src, `${ch.slug}/${l.file}`)}
${pager(
  i === 0 ? { href: "index.html", small: "הקודם", label: `פתיחת ${lbl(ch)}` } : { href: lessons[i - 1].file, small: "הקודם", label: `שיעור ${i} — ${lessons[i - 1].title}` },
  i < lessons.length - 1
    ? { href: lessons[i + 1].file, small: "הבא", label: `שיעור ${i + 2} — ${lessons[i + 1].title}` }
    : hasEx
    ? { href: "exercises.html", small: "הבא", label: "✍️ דף התרגילים של הפרק" }
    : nextCh
    ? { href: `../${nextCh.slug}/index.html`, small: "הפרק הבא", label: `${lbl(nextCh)} — ${nextCh.title}` }
    : null
)}`;
    fs.writeFileSync(path.join(outDir, l.file), page({ title: `${l.title} — ${lbl(ch)}`, depth: 1, crumbs: crumbs(`שיעור ${i + 1}`), body }));
  });

  // תרגילים ופתרונות
  let exs = [];
  if (hasEx) {
    exs = parseExercises(fs.readFileSync(path.join(ch.dir, "exercises.txt"), "utf8"));
    const ids = new Set();
    exs.forEach((e) => {
      if (ids.has(e.id)) problems.push(`${ch.slug}: מזהה כפול ${e.id}`);
      ids.add(e.id);
      if (!e.solution.trim()) problems.push(`${ch.slug}: אין פתרון ל־${e.id}`);
    });
    if (ch.expectedExercises && exs.length !== ch.expectedExercises) problems.push(`${ch.slug}: ${exs.length} תרגילים במקום ${ch.expectedExercises}`);
    const { exercises, solutions } = exercisesPages(ch, exs);
    fs.writeFileSync(path.join(outDir, "exercises.html"), exercises);
    fs.writeFileSync(path.join(outDir, "solutions.html"), solutions);
  }

  // קבצים נלווים
  for (const sub of ["starter", "solutions", "tests", "files"]) copyDir(path.join(ch.dir, sub), path.join(outDir, sub));

  // דף פתיחה
  const lessonCards = lessons
    .map((l, i) => `<a class="card" href="${l.file}"><span class="num">שיעור ${i + 1} · ~${l.minutes} דק׳</span><br><strong>${l.title}</strong></a>`)
    .join("\n    ");
  const glossary = (ch.glossary || [])
    .map(([t, p, d]) => `<tr><td><code>${esc(t)}</code></td><td>${p}</td><td>${inline(d)}</td></tr>`)
    .join("\n    ");
  const body = `  <h1>${lbl(ch)} — ${ch.title}</h1>
  <p class="subtitle">⏱ ${ch.time}${ch.fast ? " · ⚡ פרק במסלול הרענון המהיר" : ""}</p>
  <div class="box install"><span class="box-title">🧰 לפני שמתחילים — ${lbl(ch)}</span>
${renderFences(ch.install, `${ch.slug} install`)}
  </div>
${ch.fast ? `  <div class="box warn"><span class="box-title">⚡ מבחן כניסה — אולי אפשר לדלג?</span>
${renderFences(ch.entryTest || "", `${ch.slug} entry`)}
  </div>` : ""}
  <div class="box goal"><span class="box-title">🎯 בסוף הפרק תדע</span>
  <ul>${ch.goals.map((g) => `<li>${inline(g)}</li>`).join("")}</ul></div>
${ch.intro ? renderFences(ch.intro, `${ch.slug} intro`) : ""}
  <h2>השיעורים</h2>
  <div class="cards">
    ${lessonCards}
  </div>
${hasEx ? `  <h2>תרגול וסיכום</h2>
  <div class="cards">
    <a class="card" href="exercises.html"><span class="num">✍️</span><br><strong>דף התרגילים — ${exs.length} תרגילים</strong></a>
    <a class="card" href="solutions.html"><span class="num">🔒 רק אחרי ניסיון</span><br><strong>דף הפתרונות</strong></a>
  </div>` : ""}
${glossary ? `  <h2>📘 מילון המושגים של הפרק</h2>
  <div class="table-wrap"><table>
    <tr><th>מונח</th><th>הגייה</th><th>פירוש</th></tr>
    ${glossary}
  </table></div>
  <p>המילון המלא: <a href="../glossary.html">glossary.html</a></p>` : ""}
${pager(
  prevCh ? { href: `../${prevCh.slug}/index.html`, small: "הפרק הקודם", label: `${lbl(prevCh)} — ${prevCh.title}` } : { href: "../README.html", small: "חזרה", label: "דף הבית" },
  lessons[0] ? { href: lessons[0].file, small: "הבא", label: `שיעור 1 — ${lessons[0].title}` } : null
)}`;
  fs.writeFileSync(path.join(outDir, "index.html"), page({ title: `${lbl(ch)} — ${ch.title}`, depth: 1, crumbs: `<a href="../README.html">דף הבית</a> ‹ ${lbl(ch)}`, body }));
  return exs.length;
}

// ---------- בדיקות התרגילים: חייבות לעבור על הפתרון ולהיכשל על קובץ ההתחלה ----------
// Prisma Client לבדיקות: נוצר בזמן האימות בלבד ונמחק בסוף (הלומד מייצר בעצמו עם npx prisma generate)
const generatedDirs = [];
function prismaGenerate(projectDir) {
  const r = spawnSync(path.join(SRC, "node_modules", ".bin", "prisma"), ["generate"], { cwd: projectDir, encoding: "utf8" });
  if (r.status !== 0) problems.push(`prisma generate נכשל ב־${projectDir}\n${r.stdout}\n${r.stderr}`);
}

function verifyTests(ch) {
  const testsDir = path.join(OUT, ch.slug, "tests");
  if (!fs.existsSync(testsDir)) return;
  if (ch.database) ensurePg();
  for (const rel of ch.prismaProjects ?? []) {
    const dir = path.join(OUT, ch.slug, rel);
    prismaGenerate(dir);
    generatedDirs.push(dir);
  }
  for (const rel of ch.nestProjects ?? []) {
    const dir = path.join(OUT, ch.slug, rel);
    const r = spawnSync("node", [path.join(SRC, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.build.json"], { cwd: dir, encoding: "utf8" });
    if (r.status !== 0) problems.push(`build של ${rel} נכשל\n${r.stdout}\n${r.stderr}`);
    generatedDirs.push(dir);
  }
  for (const t of fs.readdirSync(testsDir).filter((f) => f.endsWith(".test.mjs"))) {
    const run = (target) =>
      spawnSync("node", ["--experimental-strip-types", "--no-warnings", "--test", "--test-reporter=dot", path.join(testsDir, t)], {
        encoding: "utf8",
        env: { ...process.env, CHECK_TARGET: target, TSC_PATH: path.join(SRC, "node_modules", "typescript", "bin", "tsc"), COURSE_DATABASE_URL: "postgresql://postgres@localhost:5433/postgres", COURSE_REDIS_URL: "redis://localhost:6380", COURSE_MYSQL_URL: "mysql://root@localhost:3307", COURSE_AWS_ENDPOINT: "http://localhost:4566", COURSE_RABBIT_URL: "amqp://localhost:5673", COURSE_KAFKA_BROKERS: "localhost:9095" },
        timeout: ch.testTimeout ?? 30000, // פרק 22: הבדיקות מריצות Jest כמה פעמים
      });
    const sol = run("solutions");
    if (sol.status !== 0) problems.push(`${ch.slug}/${t}: נכשל על הפתרון\n${sol.stdout}\n${sol.stderr}`);
    if (!ch.startersPass?.includes(t.replace(".test.mjs", ""))) {
      const st = run("starter");
      if (st.status === 0) problems.push(`${ch.slug}/${t}: עובר גם על קובץ ההתחלה`);
    }
  }
}

// ---------- דף הבית ומילון ----------
function buildHome(chapters) {
  const groups = [...new Set(chapters.map((c) => c.part))];
  const sections = groups
    .map((g) => {
      const cards = chapters
        .filter((c) => c.part === g)
        .map((c) => `<a class="card" href="${c.slug}/index.html"><span class="num">${lbl(c)}${c.fast ? " ⚡" : ""}${c.optional ? " · רשות" : ""}</span><br><strong>${c.title}</strong></a>`)
        .join("\n    ");
      return `  <h2>${g}</h2>\n  <div class="cards">\n    ${cards}\n  </div>`;
    })
    .join("\n");
  const rows = chapters.map((c) => `<tr><td>${lbl(c)} — ${c.title}</td><td>☐</td><td>☐</td><td>☐</td><td></td></tr>`).join("\n    ");
  const body = `  <h1>קורס Backend מאפס ועד ראיון</h1>
  <p class="subtitle">JavaScript ← TypeScript ← Node.js ← PostgreSQL ← NestJS ← פרויקט לתיק עבודות</p>
  <div class="box goal">
    <span class="box-title">🎯 איך משתמשים בקורס</span>
    <ol>
      <li>מתחילים תמיד ב<strong>קופסת 🧰 "לפני שמתחילים"</strong> שבראש כל פרק — שם כתוב מה להתקין ומה להעתיק.</li>
      <li>קוראים שיעור, ופותרים את התרגילים הקצרים שבסופו <strong>לפני</strong> שממשיכים לשיעור הבא.</li>
      <li>בסוף הפרק פותרים את דף התרגילים. דף הפתרונות נפרד — פותחים אותו רק אחרי ניסיון אמיתי.</li>
      <li>נתקעת? רמז 1 ← רמז 2 ← פתרון. ואם עדיין לא — שלח לי את הקוד ואת הודעת השגיאה.</li>
      <li>פרקים עם ⚡ הם פרקי רענון: יש בהם מבחן כניסה שמאפשר לדלג על רוב ההסברים.</li>
    </ol>
  </div>
  <div class="box install"><span class="box-title">🔄 איך מקבלים פרקים חדשים לתיקיית העבודה</span>
    <p>חומרי הקורס המקוריים נמצאים ב־<code>~/Desktop/Backend/backend-course</code>, ותיקיית העבודה שלך היא <code>~/dev/backend-course</code>. כשפרק חדש נוסף, <strong>העתק רק את תיקיית הפרק</strong> (למשל <code>05-functions</code>) לתוך <code>~/dev/backend-course</code> — כך העבודה שלך ב־<code>playground</code> ובפרקים קודמים לא נדרסת. הוראות מדויקות בקופסת 🧰 של כל פרק.</p>
  </div>
${sections}
  <h2>כלים</h2>
  <div class="cards">
    <a class="card" href="glossary.html"><span class="num">📘</span><br><strong>מילון מושגים עברית–אנגלית</strong></a>
  </div>
  <h2>טבלת התקדמות</h2>
  <p>סמן לעצמך (במחברת או בקובץ) מתי סיימת כל חלק:</p>
  <div class="table-wrap"><table>
    <tr><th>פרק</th><th>שיעורים</th><th>תרגילים</th><th>מבחן מעבר</th><th>נושאים לחזרה</th></tr>
    ${rows}
  </table></div>`;
  fs.writeFileSync(path.join(OUT, "README.html"), page({ title: "קורס Backend — דף הבית", depth: 0, crumbs: "", body }));

  const gl = chapters
    .filter((c) => c.glossary?.length)
    .map(
      (c) => `  <h2>${lbl(c)} — ${c.title}</h2>\n  <dl class="gloss">\n${c.glossary
        .map(([t, p, d]) => `    <dt><code>${esc(t)}</code> <small>(${p})</small></dt><dd>${inline(d)}</dd>`)
        .join("\n")}\n  </dl>`
    )
    .join("\n");
  fs.writeFileSync(
    path.join(OUT, "glossary.html"),
    page({ title: "מילון מושגים", depth: 0, crumbs: `<a href="README.html">דף הבית</a> ‹ מילון מושגים`, body: `  <h1>📘 מילון מושגים עברית–אנגלית</h1>\n  <p class="subtitle">כל המונחים של הקורס, לפי הפרק שבו הם מוסברים.</p>\n${gl}` })
  );
}

// ---------- הרצה ----------
const chapters = await loadChapters();
copyDir(path.join(SRC, "root"), OUT);
let exCount = 0;
// בזמן אימות: הבדיקות שבתוך backend-course צריכות את express/zod — קישור זמני ל־node_modules של course-src
const linkedModules = VERIFY && !fs.existsSync(path.join(OUT, "node_modules"));
if (linkedModules) fs.symlinkSync(path.join(SRC, "node_modules"), path.join(OUT, "node_modules"), "dir");
process.on("exit", () => {
  for (const ch of chapters) fs.rmSync(path.join(OUT, ch.slug, ".build"), { recursive: true, force: true }); // קומפילציות של בדיקות Nest
  for (const dir of generatedDirs) {
    for (const g of ["generated", "dist", path.join("src", "generated")]) fs.rmSync(path.join(dir, g), { recursive: true, force: true });
  }
  if (linkedModules) fs.unlinkSync(path.join(OUT, "node_modules"));
  fs.rmSync(path.join(SRC, ".run"), { recursive: true, force: true });
});
chapters.forEach((ch, i) => {
  if (ch.handwritten) return;
  if (only.length && !only.some((o) => ch.slug.startsWith(o))) return;
  exCount += buildChapter(ch, chapters[i - 1], chapters[i + 1]);
  if (VERIFY) verifyTests(ch);
});
buildHome(chapters);

// --fill: כותב את הפלטים האמיתיים במקום "?" בקובצי המקור
if (FILL && fills.size) {
  for (const ch of chapters) {
    for (const f of fs.readdirSync(ch.dir).filter((f) => f.endsWith(".html") || f.endsWith(".txt"))) {
      const file = path.join(ch.dir, f);
      let text = fs.readFileSync(file, "utf8");
      let changed = false;
      for (const [code, out] of fills) {
        const needle = `${code}\n\`\`\`\n\`\`\`out\n?\n\`\`\``;
        if (text.includes(needle)) {
          // פונקציה ולא מחרוזת: בקוד יכולים להופיע $' / $& שיש להם משמעות מיוחדת ב־replace
          text = text.replace(needle, () => `${code}\n\`\`\`\n\`\`\`out\n${out}\n\`\`\``);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(file, text);
        console.log(`מולא פלט: ${path.relative(SRC, file)}`);
      }
    }
  }
}

console.log(`נבנו ${chapters.length} פרקים/יחידות, ${exCount} תרגילים בפרקים שנבנו עכשיו.`);
if (problems.length) {
  console.error(`\n✘ ${problems.length} בעיות:\n\n` + problems.join("\n\n"));
  process.exit(1);
} else if (VERIFY) console.log(`✔ כל הדוגמאות והבדיקות אומתו (${runCount} דוגמאות קוד הורצו).`);
