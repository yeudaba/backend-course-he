import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 15.5,
  code: "15.5",
  label: "יחידה 15.5",
  title: "גישור: HTML, CSS ו־fetch",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  time: "2–3 מפגשים",
  expectedExercises: 15,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code עם התוסף <strong>Live Preview</strong> (פרק 0), Google Chrome, ופרויקט 2 בשלב א׳.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום לשיעורים 1–2. בשיעור 4 — חבילת <code>cors</code> בפרויקט 2 (שם יש הוראות).</p>
${copyStep("15w-web-bridge")}
${verifyNode}
<p><strong>✔ Live Preview:</strong> צור <code>playground/hello.html</code> עם השורה <code>&lt;h1&gt;שלום&lt;/h1&gt;</code>, לחץ עליו לחיצה ימנית ← <strong>Show Preview</strong>. אמור להיפתח חלון עם "שלום".</p>`,
  goals: [
    "לקרוא ולכתוב דף HTML בסיסי: מבנה, כותרות, רשימות, קישורים, טופס.",
    "לעצב מספיק עם CSS: צבעים, ריווח, box model, flexbox ו־RTL.",
    "לכתוב JavaScript בדפדפן: לבחור אלמנטים, להגיב לאירועים, ולהציג נתונים מ־API עם fetch.",
    "להבין CORS: למה הדפדפן חוסם, ואיך פותרים בשרת — נכון, בלי `*`.",
    "לחבר דף הדגמה לפרויקט 2.",
  ],
  intro: `<h2>🤔 למה בכלל, אם זה קורס Backend?</h2>
<p>שלוש סיבות: (1) בראיונות שואלים "מה קורה מהלחיצה על כפתור ועד שהנתונים מופיעים" — צריך להכיר את שני הצדדים; (2) שגיאות CORS הן בעיה של ה־<strong>Backend</strong>, ואי אפשר להבין אותן בלי דפדפן; (3) פרויקט עם דף שאפשר ללחוץ עליו מרשים יותר מ־curl. היחידה קצרה בכוונה — לא React, לא עיצוב מתקדם. רק מה שצריך.</p>`,
  lessons: [
    { file: "lesson-01-html.html", title: "HTML: מבנה, טקסט וטפסים", minutes: 30 },
    { file: "lesson-02-css.html", title: "CSS: מספיק כדי שלא ייראה שבור", minutes: 30 },
    { file: "lesson-03-js-fetch.html", title: "JavaScript בדפדפן ו־CORS", minutes: 45 },
    { file: "lesson-04-project.html", title: "דף הדגמה לפרויקט 2", minutes: 45, note: "🤖 PR2-WEB" },
  ],
  glossary: [
    ["HTML", "אֵייץ'־טִי־אֶם־אֶל", "שפת המבנה של דף: מה יש בו"],
    ["CSS", "סִי־אֶס־אֶס", "שפת העיצוב: איך זה נראה"],
    ["Tag / Element", "טָאג / אֶלֶמֶנְט", "`<p>...</p>` — יחידה במבנה הדף"],
    ["Attribute", "אַטְרִיבְּיוּט", "מידע נוסף על תגית: `<a href=\"...\">`"],
    ["DOM", "דוֹם", "הדף כעץ של אובייקטים ש־JavaScript יכול לקרוא ולשנות"],
    ["Selector", "סֶלֶקְטוֹר", "בחירת אלמנטים: `.card`, `#title`, `li`"],
    ["Box model", "בּוֹקְס מוֹדֶל", "content ← padding ← border ← margin"],
    ["Flexbox", "פְלֶקְס־בּוֹקְס", "סידור אלמנטים בשורה או בעמודה"],
    ["Event", "אִיוֶונְט", "משהו שקרה בדף: click, submit, input"],
    ["Origin", "אוֹרִיגִ'ין", "פרוטוקול + host + port: `http://localhost:5500`"],
    ["CORS", "קוֹרְס", "Cross-Origin Resource Sharing — השרת מתיר לדף מ־origin אחר לקרוא תשובות"],
    ["Preflight", "פְּרִי־פְלַייט", "בקשת OPTIONS שהדפדפן שולח לפני בקשה \"לא פשוטה\""],
    ["XSS", "אֶקְס־אֶס־אֶס", "הזרקת קוד לדף דרך נתונים — למשל innerHTML עם קלט של משתמש"],
  ],
  passTest: `<ul class="check">
<li>לכתוב מאפס דף עם כותרת, רשימה וטופס תקין (label לכל שדה, <code>lang</code> ו־<code>dir</code>).</li>
<li>לסדר שני אלמנטים זה לצד זה עם flexbox, ולהסביר padding מול margin.</li>
<li>לכתוב קוד שמביא נתונים מ־API ומציג אותם — עם textContent, מצב טעינה והודעת שגיאה.</li>
<li>להסביר את הודעת השגיאה של CORS, למה curl עובד כשהדפדפן נכשל, ואיך מתקנים בשרת.</li>
<li><code>npm run check P15.5</code>: לפחות 4 מתוך E06–E09 ו־E11, ו־PR2-WEB עובר בפרויקט.</li>
</ul>`,
};
