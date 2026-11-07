import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: "P1",
  label: "פרויקט 1",
  title: "מנהל הוצאות בשורת הפקודה",
  part: "חטיבה א׳ — יסודות JavaScript",
  checker: true,
  time: "4–6 מפגשים",
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, ESLint והבודק האוטומטי (פרקים 5, 8).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום. כל מה שהפרויקט צריך מובנה ב־Node.</p>
${copyStep("08p-project-expenses")}
<p>הפרויקט שלך נמצא ב־<code>08p-project-expenses/starter/expenses-cli</code>. אפשר לפתוח רק אותו ב־VS Code (<code>code 08p-project-expenses/starter/expenses-cli</code>), אבל את הבודק מריצים מתיקיית הקורס (<code>~/dev/backend-course</code>).</p>
${verifyNode}
<p><strong>✔ הבודק:</strong> <code>npm run check PR1</code> — יריץ את שלושת קובצי הבדיקה של הפרויקט (כרגע כולם נכשלים).</p>`,
  goals: [
    "לבנות תוכנית שלמה מכמה מודולים, עם הפרדה בין לוגיקה, אחסון וממשק.",
    "לשמור נתונים בקובץ JSON ולטעון אותם בהפעלה הבאה.",
    "לקבל פקודות מה־Terminal (`process.argv`) ולהחזיר קוד יציאה.",
    "לטפל בכל קלט לא תקין בהודעה ברורה, בלי שהתוכנית תקרוס.",
    "להגיע לפרויקט ראשון שעולה לתיק העבודות (בפרק 9 — ל־GitHub).",
  ],
  intro: `<h2>🤔 מה בונים</h2>
<p>כלי שורת פקודה לניהול הוצאות אישיות. אין כאן דפדפן ואין שרת — אבל המבנה הוא בדיוק המבנה של שרת: <strong>שכבת לוגיקה</strong> (חישובים וחוקים), <strong>שכבת אחסון</strong> (קובץ; בהמשך — מסד נתונים), ו<strong>שכבת ממשק</strong> (כאן Terminal; בהמשך — HTTP). כשתגיע לפרק 15, תחליף רק את שכבת הממשק — והלוגיקה תישאר.</p>
<pre class="terminal"><span class="prompt">% </span>node src/cli.js add 2026-10-01 food 54.5 lunch with team
נוספה הוצאה #1
<span class="prompt">% </span>node src/cli.js add 2026-10-03 transport 12
נוספה הוצאה #2
<span class="prompt">% </span>node src/cli.js summary 2026-10
סיכום 2026-10: 2 הוצאות, סה״כ 66.50
  food             54.50
  transport        12.00
<span class="prompt">% </span>node src/cli.js add 2026-02-30 food 5
שגיאה: תאריך לא תקין: 2026-02-30 (פורמט: YYYY-MM-DD)</pre>`,
  lessons: [
    { file: "stage-0-plan.html", title: "תכנון: מבנה, כלים חדשים והקמה", minutes: 30 },
    { file: "stage-1-logic.html", title: "שלב 1: הלוגיקה (expenses.js)", minutes: 90, note: "🤖 PR1-LOGIC" },
    { file: "stage-2-storage.html", title: "שלב 2: שמירה בקובץ (storage.js)", minutes: 40, note: "🤖 PR1-STORAGE" },
    { file: "stage-3-cli.html", title: "שלב 3: שורת הפקודה (cli.js)", minutes: 60, note: "🤖 PR1-CLI" },
    { file: "stage-4-finish.html", title: "שלב 4: גימור, README ובדיקה עצמית", minutes: 40 },
    { file: "reference.html", title: "פתרון לדוגמה והחלטות עיצוב", minutes: 30, note: "🔒 אחרי שסיימת" },
  ],
  glossary: [
    ["CLI", "סִי־אֶל־אַיי", "Command Line Interface — תוכנה שמפעילים מה־Terminal"],
    ["process.argv", "פְּרוֹסֶס אַרְג־וִוי", "המילים שהוקלדו בפקודה, כמערך"],
    ["Exit code", "אֶגְזִיט קוֹד", "המספר שתוכנית מחזירה בסיום: 0 = הצלחה, אחר = כישלון"],
    ["fs", "אֶף־אֶס", "File System — המודול של Node לקבצים"],
    ["Persistence", "פֶּרְסִיסְטֶנְס", "שמירת מידע כך שיישאר אחרי שהתוכנית נסגרת"],
    ["Separation of concerns", "סֶפָּרֵיישֶׁן", "הפרדה: כל חלק בקוד אחראי על דבר אחד"],
    ["README", "רִיד־מִי", "קובץ שמסביר מה הפרויקט ואיך מפעילים אותו"],
  ],
};
