import { copyStep } from "../../lib.mjs";

export default {
  num: "P4",
  label: "פרויקט 4",
  title: "מערכת אירועים ואנליטיקה",
  part: "חטיבה ה׳ — ראיונות והרחבות",
  checker: true,
  testTimeout: 120000,
  time: "3–4 שבועות",
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> מהיחידות 19.5, 25.5, 26.5, 28.5 ו־29.5 — MySQL, Kafka, DuckDB ו־SDK של Claude. הקונטיינרים של MySQL ו־Kafka רצים (<code>docker start mysql kafka</code>).</p>
<p><strong>מה מתחילים עכשיו:</strong> repo חדש, <code>~/dev/events-platform</code>, מאפס: <code>npm init -y</code>, <code>"type": "module"</code>, ו־<code>npm install mysql2 @platformatic/kafka @duckdb/node-api zod @anthropic-ai/sdk</code>. TypeScript רץ ישירות ב־Node 24 (<code>node src/main-ingest.ts</code>), בלי build.</p>
${copyStep("29x-project-events")}
<p><strong>✔ הבודק:</strong> קופסה שחורה, כמו בפרויקט 3 — הוא טוען את המודולים שלך לפי החוזה (שלב 0), ומריץ אותם מול MySQL ו־Kafka אמיתיים (database ו־topic חדשים לכל בדיקה):</p>
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>npm run check PR4-INGEST -- --dir ~/dev/events-platform</pre>`,
  goals: [
    "לתכנן מערכת נתונים מקצה לקצה: קליטה, תור, עיבוד, אחסון שורתי ועמודתי, ו־API — עם חוזה בין החלקים.",
    "נכונות בקנה מידה: at-least-once מ־Kafka, אידמפוטנטיות במסד, ואגרגציות שלא נספרות פעמיים גם אחרי קריסה.",
    "OLTP ו־OLAP באותה מערכת: סטטיסטיקה יומית מ־MySQL, ומשפכים מ־Parquet עם DuckDB.",
    "פריסה כמו בחברה: image אחד, ארבעה רכיבים ב־Kubernetes, CI — ועוזר AI (רשות) מעל הנתונים.",
  ],
  intro: `<h2>🤔 מה בונים</h2>
<p>פלטפורמה שקולטת אירועי מוצר — "צפה בדף", "הוסיף לעגלה", "קנה" — מכמה לקוחות (tenants), בנפח גבוה, ונותנת להם סטטיסטיקה ומשפכי המרה. זו בדיוק הארכיטקטורה של מוצרי אנליטיקה (וגם של "events pipeline" בתוך כל חברה גדולה), והיא מחברת את כל מה שנוסף לקורס בעקבות המודעה: MySQL, Kafka, נתונים עמודתיים, Kubernetes ו־AI. פרויקט 3 הוכיח שאתה בונה API נכון; פרויקט 4 מוכיח שאתה בונה <em>מערכת</em> — כמה רכיבים, נתונים שזורמים ביניהם, והחלטות על כל קצה.</p>
<pre class="mono" style="direction:ltr;text-align:left">client ── POST /v1/events ──▶ ingest ──▶ Kafka ──▶ processor ──▶ MySQL
                                                                  │
        query API ◀── DuckDB ◀── lake (Parquet) ◀── export (cron) ┘
            │
   /v1/stats/daily · /v1/funnel · (assistant)</pre>`,
  lessons: [
    { file: "stage-0-plan.html", title: "תכנון: רכיבים, חוזה וסכמה", minutes: 90 },
    { file: "stage-1-ingest.html", title: "שלב 1: שירות הקליטה", minutes: 240, note: "🤖 PR4-INGEST" },
    { file: "stage-2-process.html", title: "שלב 2: ה־processor — פעם אחת בדיוק", minutes: 300, note: "🤖 PR4-PROCESS" },
    { file: "stage-3-analytics.html", title: "שלב 3: lake ו־API שאילתות", minutes: 300, note: "🤖 PR4-EXPORT, PR4-QUERY" },
    { file: "stage-4-deploy.html", title: "שלב 4: Docker, Kubernetes, CI ו־README", minutes: 240, note: "🤖 PR4-DEPLOY" },
    { file: "stage-5-assistant.html", title: "שלב 5 (רשות): עוזר אנליטיקה", minutes: 120, note: "🤖 PR4-AGENT" },
    { file: "reference.html", title: "פתרון לדוגמה והחלטות עיצוב", minutes: 45, note: "🔒 אחרי שסיימת" },
  ],
  glossary: [
    ["Tenant", "טֶנַנְט", "לקוח של הפלטפורמה; הנתונים שלו מופרדים משל כל השאר"],
    ["Ingest", "אִינְגֶ׳סְט", "קליטה: לקבל אירועים מהר, לאמת, ולהעביר הלאה"],
    ["Pipeline", "פַּייפְּלַיין", "שרשרת רכיבים שהנתונים זורמים דרכה"],
    ["Funnel", "פַאנֶל", "משפך: כמה משתמשים עשו שלב 1, אחריו שלב 2, אחריו שלב 3"],
    ["DAU", "דִי־אֵיי־יוּ", "Daily Active Users — משתמשים שונים שהיו פעילים ביום"],
    ["Watermark", "ווֹטֶרְמַארְק", "עד איפה עיבדנו/ייצאנו — כדי להמשיך משם"],
    ["Append-only", "אַפֶּנְד־אוֹנְלִי", "רק מוסיפים, לא משנים — אירועים, קבצים ב־lake"],
  ],
  passTest: `<ul class="check">
<li>PR4-INGEST, PR4-PROCESS, PR4-EXPORT, PR4-QUERY ו־PR4-DEPLOY עוברים (PR4-AGENT — רשות).</li>
<li>אפשר להסביר בראיון: למה Kafka באמצע, איפה כל אירוע נספר פעם אחת, למה סטטיסטיקה מ־MySQL ומשפך מ־Parquet.</li>
<li>README עם תרשים, החלטות, ואיך מריצים.</li>
</ul>`,
};
