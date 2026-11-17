import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 8,
  code: "08",
  title: "ארגון קוד ואיתור תקלות",
  part: "חטיבה א׳ — יסודות JavaScript",
  checker: true,
  time: "4 מפגשים",
  expectedExercises: 80,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, הבודק האוטומטי.</p>
<p><strong>מה מתקינים עכשיו: ESLint</strong> — כלי שקורא את הקוד ומסמן טעויות נפוצות (כמו <code>==</code> או משתנה שלא בשימוש) עוד לפני שמריצים.</p>
<ol class="steps">
<li>העתק מחדש מ־<code>~/Desktop/Backend/backend-course</code> אל <code>~/dev/backend-course</code> את הקובץ <code>package.json</code> (בחר <strong>Replace</strong> — הוא התעדכן) ואת הקובץ החדש <code>eslint.config.mjs</code>.</li>
<li>ב־Terminal, מתוך <code>~/dev/backend-course</code>, הרץ פעם אחת:
<pre class="terminal"><span class="prompt">% </span>npm install</pre>
הפקודה מורידה את ESLint לתיקייה חדשה בשם <code>node_modules</code> (כמה עשרות שניות, דורש אינטרנט). מה בדיוק קרה כאן — נלמד בפרק 13. אם מופיעות כמה שורות <code>npm warn</code> — זה תקין.</li>
<li>תוסף ל־VS Code: <a href="https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint" target="_blank">ESLint</a> (מזהה <code>dbaeumer.vscode-eslint</code>, של Microsoft). אחרי ההתקנה, בעיות יסומנו בקו גלי צהוב/אדום ישר בעורך.</li>
<li>בדיקה:
<pre class="terminal"><span class="prompt">% </span>npx eslint 01-values-variables/starter/P01-E23-old-code.js</pre>
אמורות להופיע שגיאות <code>no-var</code> — בדיוק מה שתיקנת בפרק 1.</li>
</ol>
${copyStep("08-modules-errors")}
${verifyNode}`,
  goals: [
    "לפצל קוד לכמה קבצים עם `module.exports`/`require` ועם `export`/`import` — ולהבין סוף־סוף את השורה בתחתית קובצי התרגילים.",
    "לזרוק שגיאות עם `throw` ולתפוס אותן עם `try/catch/finally`.",
    "לבחור מתי להחזיר `null` ומתי לזרוק שגיאה.",
    "לקרוא stack trace עד הסוף ולהגיע לשורה שלך.",
    "להשתמש ב־Debugger של VS Code: breakpoints, צעד־אחר־צעד ומעקב אחרי משתנים.",
    "להשתמש ב־ESLint ובשיטת עבודה מסודרת לאיתור באגים.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>הקוד שלך גדל. בפרויקט הראשון (מיד אחרי הפרק) יהיו כמה מאות שורות — בקובץ אחד זה בלתי אפשרי לתחזק. ושרת אמיתי לא "קורס" כשמשהו משתבש: הוא תופס את השגיאה ומחזיר הודעה מסודרת. והכי חשוב: מכאן ואילך רוב הזמן שלך כמפתח יעבור על <strong>הבנה למה משהו לא עובד</strong>. הפרק הזה נותן לך את הכלים לזה.</p>`,
  lessons: [
    { file: "lesson-01-modules.html", title: "מודולים: קוד בכמה קבצים", minutes: 35 },
    { file: "lesson-02-errors.html", title: "throw, try/catch ו־finally", minutes: 35 },
    { file: "lesson-03-debugger.html", title: "stack trace וה־Debugger של VS Code", minutes: 40 },
    { file: "lesson-04-method.html", title: "ESLint ושיטה לאיתור באגים", minutes: 25 },
  ],
  glossary: [
    ["Module", "מוֹדְיוּל", "קובץ קוד שמייצא דברים לקבצים אחרים"],
    ["export / import", "אֶקְסְפּוֹרְט / אִימְפּוֹרְט", "ייצוא/ייבוא בתחביר המודרני (ES Modules)"],
    ["module.exports / require", "רִיקְוַוייר", "ייצוא/ייבוא בתחביר הישן של Node (CommonJS)"],
    ["Exception", "אֶקְסֶפְּשֶׁן", "חריגה — שגיאה שנזרקה ועוצרת את הזרימה הרגילה"],
    ["throw", "ת'רוֹאוּ", "זריקת שגיאה: `throw new Error(\"...\")`"],
    ["try / catch / finally", "טְרַיי / קֶאץ' / פַיינָלִי", "ניסיון / טיפול בשגיאה / קוד שרץ בכל מקרה"],
    ["Stack trace", "סְטֶאק טְרֵייס", "רשימת הפונקציות שנקראו עד לשגיאה"],
    ["Debugger", "דִיבָּאגֶר", "כלי שעוצר את התוכנית ומאפשר להסתכל פנימה"],
    ["Breakpoint", "בְּרֵייקְפּוֹיְנְט", "נקודת עצירה — שורה שבה הדיבאגר עוצר"],
    ["Step over / into", "סְטֶפּ אוֹבֶר / אִינְטוּ", "התקדמות שורה אחת / כניסה לתוך פונקציה"],
    ["Linter", "לִינְטֶר", "כלי שבודק את הקוד בלי להריץ (ESLint)"],
    ["Reproduce", "רִיפְּרוֹדְיוּס", "לשחזר באג — לגרום לו לקרות שוב בכוונה"],
  ],
  passTest: `<ul class="check">
<li>לפצל קובץ אחד לשניים — אחד מייצא פונקציות, השני משתמש בהן — בשני הסגנונות.</li>
<li>לכתוב פונקציית בדיקת קלט שזורקת שגיאה, ולתפוס אותה בקוד שקורא לה עם הודעה ידידותית.</li>
<li>לעצור תוכנית ב־breakpoint, לבדוק ערכים של משתנים ולמצוא באג בלולאה — בלי <code>console.log</code>.</li>
<li>לקרוא stack trace של 5 שורות ולהגיע לשורה הנכונה בקוד שלך.</li>
<li><code>npm run check P08</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
