import { copyStep } from "../../lib.mjs";

export default {
  num: 11,
  code: "11",
  title: "TypeScript בסיסי",
  part: "חטיבה ב׳ — TypeScript ו־Node.js",
  checker: true,
  time: "4 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, הבודק האוטומטי.</p>
<p><strong>מה מתקינים עכשיו: TypeScript</strong> — בתוך תיקיית הקורס, לא כתוכנה במחשב.</p>
<ol class="steps">
<li>העתק מחדש מ־<code>~/Desktop/Backend/backend-course</code> אל <code>~/dev/backend-course</code> את <code>package.json</code> (Replace) ואת הקובץ החדש <code>tsconfig.json</code>.</li>
<li>מתוך <code>~/dev/backend-course</code>:
<pre class="terminal"><span class="prompt">% </span>npm install</pre></li>
<li>בדיקה:
<pre class="terminal"><span class="prompt">% </span>npx tsc -v
Version 5.9.3</pre>
(כל גרסה 5.x תקינה.)</li>
<li><strong>תוסף ל־VS Code: לא צריך.</strong> VS Code כתוב ב־TypeScript ותומך בו מובנה — שגיאות טיפוסים יסומנו בקו אדום ישר בעורך, לפי ה־<code>tsconfig.json</code> שהעתקת.</li>
</ol>
${copyStep("11-typescript")}
<p><strong>✔ הרצת קובץ TypeScript:</strong> ב־Node 24, <code>node file.ts</code> עובד ישירות. אם מופיעה שגיאה <code>Unknown file extension ".ts"</code> — גרסת ה־Node ישנה; חזור לפרק 0, שיעור 2, ועדכן.</p>`,
  goals: [
    "להבין מה TypeScript מוסיף, ומה ההבדל בין הרצת קוד לבין בדיקת טיפוסים.",
    "לתת טיפוסים למשתנים, פרמטרים, ערכי החזרה, מערכים ואובייקטים.",
    "להגדיר טיפוסים עם `type` ו־`interface`, כולל שדות אופציונליים ו־`readonly`.",
    "להשתמש ב־union ו־literal types, ולצמצם טיפוסים (narrowing).",
    "לעבוד נכון עם `unknown` במקום `any`, ולכתוב type guards.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרקים הקודמים ראית באגים שנולדו מ"סוג לא נכון": <code>"5" + 3</code>, שדה בשם שגוי שהחזיר <code>undefined</code>, פונקציה שקיבלה מחרוזת במקום מספר. JavaScript מגלה אותם רק כשהקוד רץ — ולפעמים אצל משתמש. TypeScript מגלה אותם <strong>בזמן שאתה מקליד</strong>. כמעט כל משרת Backend חדשה ב־Node דורשת TypeScript, וגם NestJS (פרק 20) כתוב בו.</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "מה זה TypeScript, וטיפוסים בסיסיים", minutes: 35 },
    { file: "lesson-02-objects-functions.html", title: "אובייקטים, מערכים ופונקציות", minutes: 40 },
    { file: "lesson-03-unions.html", title: "union, literal types ו־narrowing", minutes: 40 },
    { file: "lesson-04-unknown.html", title: "unknown, any ו־type guards", minutes: 30 },
  ],
  glossary: [
    ["TypeScript", "טַייפּסְקְרִיפְּט", "JavaScript עם טיפוסים, שנבדקים לפני ההרצה"],
    ["Type annotation", "אָנוֹטֵיישֶׁן", "ציון טיפוס במפורש: `let price: number`"],
    ["Type inference", "אִינְפֶרֶנְס", "הסקה — TypeScript מנחש את הטיפוס בעצמו"],
    ["Type checker / tsc", "טִי־אֶס־סִי", "הכלי שבודק טיפוסים (TypeScript Compiler)"],
    ["Type alias", "אֵיילִיאַס", "שם לטיפוס: `type User = { ... }`"],
    ["Interface", "אִינְטֶרְפֵייס", "הגדרת צורה של אובייקט"],
    ["Optional property", "אוֹפְּשֶׁנַל", "שדה שאולי לא קיים: `age?: number`"],
    ["Union type", "יוּנְיוֹן", "\"אחד מ...\": `string | number`"],
    ["Literal type", "לִיטֶרַל", "טיפוס של ערך מדויק: `\"paid\" | \"pending\"`"],
    ["Narrowing", "נָרוֹאִינְג", "צמצום טיפוס בעזרת בדיקה (`typeof`, `===`, `in`)"],
    ["Discriminated union", "דִיסְקְרִימִינֵייטֶד", "union של אובייקטים עם שדה משותף שמבחין ביניהם"],
    ["any", "אֶנִי", "\"כבה את הבדיקה\" — מסוכן"],
    ["unknown", "אַנְנוֹאוּן", "\"לא ידוע\" — חייב לבדוק לפני שימוש"],
    ["Type guard", "גַארְד", "פונקציה שמוכיחה ל־TypeScript מה הטיפוס: `x is User`"],
    ["Type assertion (as)", "אַסֶרְשֶׁן", "\"תאמין לי\" — עוקף את הבדיקה"],
  ],
  passTest: `<ul class="check">
<li>להמיר קובץ JavaScript מפרק 7 ל־TypeScript עם טיפוסים מלאים ובלי <code>any</code>, כך ש־<code>npx tsc --noEmit</code> עובר.</li>
<li>להגדיר discriminated union לסטטוס הזמנה ולכתוב פונקציה שמטפלת בכל המקרים — כך ששכחה של מקרה תיתן שגיאת טיפוסים.</li>
<li>לקבל <code>unknown</code> (למשל מ־<code>JSON.parse</code>) ולהוכיח עם type guard שזה אובייקט מהצורה הנכונה.</li>
<li>להסביר למה TypeScript לא מגן על קלט שמגיע מהרשת בזמן ריצה.</li>
<li><code>npm run check P11</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
