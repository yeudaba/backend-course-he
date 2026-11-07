import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: "P2",
  label: "פרויקט 2",
  title: "API לניהול משימות — שלב א׳: בזיכרון",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  time: "4–6 מפגשים",
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+, VS Code, REST Client, Git וחשבון GitHub (פרק 9).</p>
<p><strong>מה מתקינים עכשיו:</strong> את התלויות של הפרויקט — בתוך תיקיית הפרויקט עצמו (שלב 0).</p>
${copyStep("15p-project-tasks")}
${verifyNode}
<p><strong>✔ הבודק:</strong> הפרויקט יגור בתיקייה משלו (<code>~/dev/tasks-api</code>), עם Git משלו. כדי לבדוק אותו, מתיקיית הקורס:</p>
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>npm run check PR2 -- --dir ~/dev/tasks-api</pre>
<p>(ה־<code>--</code> אומר ל־npm "מה שאחריי — לבודק, לא לך".)</p>`,
  goals: [
    "לבנות API שלם מאפס, בפרויקט נפרד עם Git ו־GitHub מהיום הראשון.",
    "לחלק לשכבות: schema ← routes ← service ← repository.",
    "CRUD מלא, ולידציה, שגיאות אחידות, סינון, מיון, pagination וסטטיסטיקה.",
    "repository אסינכרוני — כך שבפרק 19 נחליף אותו ב־PostgreSQL בלי לגעת בשאר.",
    "README ו־requests.http שמאפשרים לכל אחד להפעיל ולנסות את הפרויקט תוך דקה.",
  ],
  intro: `<h2>🤔 מה בונים</h2>
<p>API לניהול משימות. זה הפרויקט ש<strong>גדל איתך</strong>: עכשיו — בזיכרון; ביחידה 15.5 — דף HTML שמדבר איתו; בפרק 19 — PostgreSQL; בפרק 20 — NestJS; בפרק 21 — משתמשים והרשאות; בפרק 22 — בדיקות. ב־GitHub, היסטוריית ה־commits תראה למראיין את כל הדרך.</p>
<pre class="terminal"><span class="prompt">% </span>curl -s -X POST localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"ללמוד Express","priority":"high"}'
{"id":1,"title":"ללמוד Express","description":null,"status":"todo","priority":"high","dueDate":null,"createdAt":"2026-11-04T19:09:09.056Z","updatedAt":"2026-11-04T19:09:09.056Z"}
<span class="prompt">% </span>curl -s "localhost:3000/tasks?status=todo&amp;sort=-priority&amp;limit=10"
{"data":[{"id":1,"title":"ללמוד Express",...}],"meta":{"page":1,"limit":10,"total":1,"totalPages":1}}</pre>`,
  lessons: [
    { file: "stage-0-plan.html", title: "תכנון, הקמה ו־Git", minutes: 40 },
    { file: "stage-1-core.html", title: "שלב 1: schema, repository ו־service", minutes: 90, note: "🤖 PR2-SCHEMA, PR2-SERVICE" },
    { file: "stage-2-http.html", title: "שלב 2: routes, ולידציה ושגיאות", minutes: 75, note: "🤖 PR2-API" },
    { file: "stage-3-list.html", title: "שלב 3: סינון, מיון, pagination וסטטיסטיקה", minutes: 60, note: "🤖 PR2-LIST" },
    { file: "stage-4-finish.html", title: "שלב 4: README, GitHub ובדיקה עצמית", minutes: 40 },
    { file: "reference.html", title: "פתרון לדוגמה והחלטות עיצוב", minutes: 30, note: "🔒 אחרי שסיימת" },
  ],
  glossary: [
    ["Repository (pattern)", "רֶפּוֹזִיטוֹרִי", "שכבה שאחראית רק על שמירה ושליפה"],
    ["Service", "סֶרְוִויס", "שכבת החוקים העסקיים — לא יודעת על HTTP"],
    ["DTO", "דִי־טִי־אוֹ", "Data Transfer Object — מבנה הנתונים שנכנס/יוצא ב־API (כאן: הסכמות)"],
    ["Seed", "סִיד", "נתונים התחלתיים לפיתוח ולבדיקות"],
    ["422", "פוֹר־טוּ־טוּ", "Unprocessable — הקלט תקין מבנית אבל מפר חוק עסקי"],
  ],
};
