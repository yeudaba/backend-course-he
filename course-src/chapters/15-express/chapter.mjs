import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 15,
  code: "15",
  title: "Express ו־REST",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  time: "5 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+, VS Code, תוסף REST Client (פרק 14).</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li><a href="https://expressjs.com/" target="_blank">Express 5</a> — ספריית השרת הנפוצה ביותר ב־Node. <a href="https://zod.dev/" target="_blank">Zod 4</a> — בדיקת קלט. בתיקיית הקורס הן כבר רשומות ב־<code>package.json</code>, אז מספיק:</li>
</ul>
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>npm install</pre>
<p>(בפרויקט חדש משלך — <code>npm install express zod</code> ו־<code>npm install -D @types/express</code>. נעשה את זה בפרויקט 2.)</p>
${copyStep("15-express")}
${verifyNode}
<p><strong>✔ בדיקה:</strong> <code>node -e "import('express').then(m =&gt; console.log('express', typeof m.default))"</code> ← <code>express function</code>.</p>
<p><strong>שפה:</strong> מהפרק הזה והלאה כל הקוד ב־<strong>TypeScript</strong> (קבצי <code>.ts</code>). Node 24 מריץ אותם ישירות: <code>node src/server.ts</code>.</p>`,
  goals: [
    "לבנות שרת Express: routes, params, query, גוף JSON ותשובות עם status נכון.",
    "להבין middleware: שרשרת, סדר, `next()`, טיפול בשגיאות ו־404.",
    "לתכנן REST API: כתובות, methods, סינון, מיון, pagination ומבנה שגיאות אחיד.",
    "לבדוק כל קלט בגבול המערכת עם Zod — ולקבל טיפוסי TypeScript בחינם.",
    "לפרק שרת לשכבות: routes ← service ← repository (פרק 12).",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרק 14 כתבת שרת עם <code>node:http</code> וראית כמה "צנרת" זה דורש: פירוק כתובות, קריאת גוף, if־ים. Express עושה את הצנרת, ומשאיר לך את הלוגיקה. הוא הספרייה הנפוצה ביותר לשרתי Node, והבסיס שעליו בנוי NestJS (פרק 20). כמעט כל משרת Junior Node תבקש "ניסיון ב־Express / REST API". בסוף הפרק מתחיל <strong>פרויקט 2</strong> — API משימות שיגדל איתך עד סוף הקורס.</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "השרת הראשון ב־Express", minutes: 35 },
    { file: "lesson-02-middleware.html", title: "middleware, שגיאות ו־404", minutes: 40 },
    { file: "lesson-03-rest.html", title: "תכנון REST: כתובות, pagination ושכבות", minutes: 40 },
    { file: "lesson-04-zod.html", title: "בדיקת קלט עם Zod", minutes: 40 },
  ],
  glossary: [
    ["Express", "אֶקְסְפְּרֶס", "ספריית שרת HTTP ל־Node"],
    ["Route", "רָאוּט", "צירוף method + path ← handler"],
    ["Handler", "הֶנְדְּלֶר", "הפונקציה שמטפלת בבקשה: `(req, res) => ...`"],
    ["Middleware", "מִידֶלְוֶור", "פונקציה שרצה בשרשרת לפני (או במקום) ה־handler: `(req, res, next)`"],
    ["Error handler", "אֶרוֹר הֶנְדְּלֶר", "middleware עם 4 פרמטרים `(err, req, res, next)` — תופס שגיאות"],
    ["Router", "רָאוּטֶר", "קבוצת routes שמחוברת לקידומת: `app.use(\"/users\", router)`"],
    ["REST", "רֶסְט", "סגנון API: משאבים (שמות עצם) בכתובות, פעולות לפי method"],
    ["Pagination", "פָּגִינֵיישֶׁן", "חלוקת תוצאות לעמודים: `?page=2&limit=20`"],
    ["Validation", "וָלִידֵיישֶׁן", "בדיקה שהקלט במבנה ובטווח הנכון"],
    ["Schema", "סְקִימָה", "תיאור של מבנה נתונים מותר — ב־Zod: `z.object({...})`"],
    ["Coerce", "קוֹאֶרְס", "המרה כפויה של טיפוס: \"5\" ← 5 (שימושי ל־query)"],
    ["res.locals", "רֶס לוֹקָאלְס", "אובייקט להעברת נתונים בין middleware ל־handler באותה בקשה"],
  ],
  passTest: `<ul class="check">
<li>לבנות מאפס API של משאב אחד (CRUD) ב־Express, עם status נכון לכל מקרה.</li>
<li>להסביר מה קורה כשמחליפים סדר של שני <code>app.use</code> — ולתקן שרת שבו הסדר שגוי.</li>
<li>לכתוב error handler אחד שמטפל ב־JSON שבור, בשגיאת ולידציה, ב"לא נמצא" ובבאג.</li>
<li>לכתוב סכמת Zod ל־body ול־query (עם coerce), ולהחזיר 400 עם פירוט השדות.</li>
<li>להוסיף pagination וסינון לרשימה, עם <code>meta</code> בתשובה.</li>
<li><code>npm run check P15</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
