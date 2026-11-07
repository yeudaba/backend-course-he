import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 5,
  code: "05",
  title: "פונקציות",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  checker: true,
  time: "4 מפגשים (במסלול המהיר: 2)",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, Error Lens, Prettier.</p>
<p><strong>מה חדש: הבודק האוטומטי.</strong> מהפרק הזה, רוב תרגילי הקוד באים עם בדיקות מוכנות. אתה כותב את הפתרון בקובץ ההתחלה, ומריץ פקודה אחת שאומרת לך מה עובד ומה לא.</p>
<ol class="steps">
<li><strong>פעם אחת בלבד:</strong> ב־Finder, העתק מ־<code>~/Desktop/Backend/backend-course</code> אל <code>~/dev/backend-course</code> את הקובץ <code>package.json</code> ואת התיקייה <code>tools</code>.</li>
<li>העתק גם את תיקיית הפרק <code>05-functions</code> (ראה למטה).</li>
<li>בדיקה — ב־Terminal של VS Code, מתוך <code>~/dev/backend-course</code>:</li>
</ol>

\`\`\`term
% npm run check P05-E06
.. > backend-course@ check
.. > node tools/check.mjs P05-E06
בודק 1 קובצי בדיקה עבור P05-E06...
✖ ...
✘ יש בדיקות שנכשלו. קרא את ההודעה מעל: מה ציפינו ומה קיבלנו.
\`\`\`

<p>זה <strong>תקין</strong> — עוד לא פתרת את התרגיל, ולכן הבדיקות נכשלות. אם קיבלת <code>Missing script: "check"</code> — <code>package.json</code> לא הועתק, או שאתה לא בתיקייה הנכונה (<code>pwd</code>).</p>
${copyStep("05-functions")}
${verifyNode}`,
  entryTest: `<ol>
<li>מה ההבדל בין פרמטר לארגומנט?</li>
<li>מה ידפיס: <code>function f(x) { x * 2; } console.log(f(5));</code></li>
<li>כתוב פונקציה <code>isEven(n)</code> שמחזירה בוליאני.</li>
<li>כתוב את אותה פונקציה כ־arrow function בשורה אחת.</li>
<li>מה ידפיס: <code>function greet(name = "אורח") { return "שלום " + name; } console.log(greet());</code></li>
<li>מה ההבדל בין <code>return</code> ל־<code>console.log</code> בתוך פונקציה?</li>
<li>מה יקרה: <code>function f() { const a = 1; } f(); console.log(a);</code></li>
<li>מה ידפיס: <code>const apply = (fn, v) =&gt; fn(v); console.log(apply((x) =&gt; x + 1, 9));</code></li>
<li>מה זה "פונקציה טהורה" (pure function)?</li>
<li>למה <code>return</code> מוקדם (guard clause) עדיף על <code>if</code> מקונן?</li>
</ol>
<details><summary>תשובות</summary><div><ol>
<li>פרמטר — השם בהגדרה; ארגומנט — הערך שמעבירים בקריאה.</li>
<li><code>undefined</code> — אין <code>return</code>.</li>
<li><code>function isEven(n) { return n % 2 === 0; }</code></li>
<li><code>const isEven = (n) =&gt; n % 2 === 0;</code></li>
<li><code>שלום אורח</code></li>
<li><code>return</code> מחזיר ערך למי שקרא (אפשר להשתמש בו); <code>console.log</code> רק מדפיס.</li>
<li><code>ReferenceError: a is not defined</code></li>
<li><code>10</code></li>
<li>תלויה רק בפרמטרים שלה, מחזירה תמיד אותה תוצאה לאותו קלט, ולא משנה שום דבר מחוצה לה.</li>
<li>משאיר את הקוד "שטוח": המקרים הרעים מטופלים ויוצאים, והמקרה הטוב בסוף בלי קינון.</li>
</ol>
<p><strong>8 ומעלה:</strong> קרא קופסאות ⚡ ואת שיעור 4 (גישור + הבודק), ופתור P05-E13 עד P05-E25. <strong>פחות:</strong> הפרק המלא — זה פרק קריטי.</p></div></details>`,
  goals: [
    "להגדיר פונקציה, לקרוא לה, ולהעביר לה ארגומנטים.",
    "להחזיר ערך עם `return` — ולהבין למה זה שונה מהדפסה.",
    "לכתוב guard clauses ופרמטרים עם ברירת מחדל.",
    "לכתוב arrow functions ולהעביר פונקציה כערך לפונקציה אחרת.",
    "להבין scope: איפה משתנה \"חי\".",
    "לפרק בעיה לפונקציות קטנות, ולבדוק אותן עם הבודק האוטומטי.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בתרגיל ראשי התיבות (P02-E09) כתבת פעמיים "אות ראשונה גדולה + השאר". בבדיקת ההזמנה (P03-E24) — 60 שורות שטוחות. פונקציה נותנת לחתיכת קוד <strong>שם</strong>, כותבת אותה <strong>פעם אחת</strong>, ומאפשרת להשתמש בה <strong>שוב ושוב</strong> עם ערכים שונים. בשרת אמיתי, כמעט כל שורת קוד נמצאת בתוך פונקציה: <code>createOrder</code>, <code>validateEmail</code>, <code>calculateTotal</code>.</p>`,
  lessons: [
    { file: "lesson-01-first-function.html", title: "פונקציה ראשונה: פרמטרים ו־return", minutes: 35 },
    { file: "lesson-02-return-guards.html", title: "return לעומק, ברירות מחדל ו־guard clauses", minutes: 30 },
    { file: "lesson-03-arrow-scope.html", title: "arrow functions, scope ופונקציה כערך", minutes: 35 },
    { file: "lesson-04-decompose.html", title: "גישור: פירוק בעיה לפונקציות + הבודק האוטומטי", minutes: 30, note: "יחידת גישור" },
  ],
  glossary: [
    ["Function", "פַאנְקְשֶׁן", "פונקציה — קוד עם שם שאפשר להפעיל שוב ושוב"],
    ["Call / Invoke", "קוֹל / אִינְווֹק", "קריאה — הפעלת פונקציה: `greet()`"],
    ["Parameter", "פָּרָמֶטֶר", "השם שמקבל ערך בהגדרת הפונקציה: `function f(name)`"],
    ["Argument", "אַרְגְיוּמֶנְט", "הערך שמעבירים בקריאה: `f(\"דנה\")`"],
    ["return", "רִיטֶרְן", "החזרת ערך למי שקרא לפונקציה — וסיום הפונקציה"],
    ["Default parameter", "דִיפוֹלְט", "ערך לפרמטר אם לא הועבר ארגומנט"],
    ["Guard clause", "גַארְד קְלוֹז", "בדיקה בתחילת פונקציה שמחזירה מוקדם במקרה לא תקין"],
    ["Arrow function", "אָרוֹ פַאנְקְשֶׁן", "כתיב מקוצר: `(x) => x * 2`"],
    ["Scope", "סְקוֹפּ", "התחום שבו משתנה מוכר"],
    ["Side effect", "סַייד אֶפֶקְט", "תופעת לוואי — שינוי של משהו מחוץ לפונקציה (הדפסה, שינוי משתנה חיצוני, כתיבה למסד)"],
    ["Pure function", "פְּיוּר", "פונקציה טהורה — אותו קלט ← אותה תוצאה, בלי תופעות לוואי"],
    ["Callback", "קוֹלְבֶּק", "פונקציה שמעבירים לפונקציה אחרת כדי שתקרא לה"],
    ["module.exports", "מוֹדְיוּל אֶקְסְפּוֹרְטְס", "השורה שמאפשרת לקבצים אחרים (ולבודק) להשתמש בפונקציה — נלמד בפרק 8"],
  ],
  passTest: `<ul class="check">
<li>לכתוב בלי עזרה פונקציה עם 2 פרמטרים, ערך ברירת מחדל ו־guard clause, שמחזירה ערך.</li>
<li>להסביר למה <code>const r = printTotal(5)</code> נותן <code>undefined</code> כשהפונקציה רק מדפיסה.</li>
<li>לכתוב פונקציה שמקבלת פונקציה אחרת כפרמטר ומפעילה אותה.</li>
<li>לפרק תרגיל מפרק 3 או 4 לשלוש פונקציות קטנות.</li>
<li><code>npm run check P05</code> — לפחות 80% מהבדיקות של E06–E19 עוברות, ולפחות תרגיל תיקון אחד (E20–E23).</li>
</ul>`,
};
