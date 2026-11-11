import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 3,
  code: "03",
  title: "תנאים",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  checker: true,
  time: "3 מפגשים (במסלול המהיר: 1–2)",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, Error Lens, Prettier.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
<p><strong>🤖 הבודק האוטומטי:</strong> תרגילי הכתיבה נבדקים כמו בפרק 1 — <code>npm run check P03-E06</code> (לפי מזהה התרגיל). אם דילגת על פרק 1: העתק פעם אחת את <code>package.json</code> ואת התיקייה <code>tools</code> (ראה קופסת 🧰 של פרק 1).</p>
${copyStep("03-conditions")}
${verifyNode}`,
  entryTest: `<ol>
<li><code>console.log(5 === "5", 5 == "5");</code></li>
<li><code>console.log(10 > 3 && 2 > 5);</code></li>
<li><code>console.log(!(3 < 1) || false);</code></li>
<li>מה ידפיס: <code>const t = 15; if (t > 25) { console.log("חם"); } else if (t > 10) { console.log("נעים"); } else { console.log("קר"); }</code></li>
<li>אילו מהערכים "falsy": <code>0</code>, <code>"0"</code>, <code>""</code>, <code>" "</code>, <code>null</code>, <code>NaN</code>?</li>
<li><code>console.log(0 || 50, 0 ?? 50);</code></li>
<li>כתוב ב־ternary: אם <code>age</code> 18 ומעלה — <code>"בגיר"</code>, אחרת <code>"קטין"</code>.</li>
<li>מה הבאג: <code>if (role = "admin") { ... }</code></li>
<li><code>console.log("apple" &lt; "banana");</code></li>
<li>מה ההבדל בין <code>if (x) ...</code> לבין <code>if (x !== undefined) ...</code> כש־<code>x</code> הוא <code>0</code>?</li>
</ol>
<details><summary>תשובות</summary><div><ol>
<li><code>false true</code></li>
<li><code>false</code></li>
<li><code>true</code></li>
<li><code>נעים</code></li>
<li><code>0</code>, <code>""</code>, <code>null</code>, <code>NaN</code></li>
<li><code>50 0</code></li>
<li><code>const label = age &gt;= 18 ? "בגיר" : "קטין";</code></li>
<li><code>=</code> מציב במקום להשוות — התנאי תמיד מתקיים. צריך <code>===</code>.</li>
<li><code>true</code> (השוואה לפי סדר מילוני)</li>
<li><code>if (0)</code> לא נכנס (0 falsy), ואילו <code>0 !== undefined</code> הוא <code>true</code> ונכנס.</li>
</ol>
<p><strong>8 ומעלה:</strong> קרא רק קופסאות ⚡ ופתור P03-E13 עד P03-E25. <strong>פחות:</strong> הפרק המלא.</p></div></details>`,
  goals: [
    "להשוות ערכים עם `===`, `!==`, `<`, `>`, `<=`, `>=` — ולדעת למה לא `==`.",
    "לבנות החלטות עם `if`, `else if`, `else`.",
    "לשלב תנאים עם `&&`, `||`, `!`, ולמלא טבלת אמת.",
    "להבין truthy/falsy, ולתת ערך ברירת מחדל עם `??`.",
    "לכתוב ternary ו־`switch`, ולבדוק קלט עם \"guard clauses\".",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>שרת מקבל החלטות כל הזמן: "האם הסיסמה נכונה?", "האם יש מספיק מלאי?", "האם המשתמש הוא מנהל?", "האם הקלט חוקי — ואם לא, איזו הודעת שגיאה להחזיר?". כל ההחלטות האלה הן תנאים. בסוף הפרק תכתוב את הבדיקות האלה בעצמך.</p>`,
  lessons: [
    { file: "lesson-01-comparisons.html", title: "השוואות: === ו־!==", minutes: 25 },
    { file: "lesson-02-if-else.html", title: "if, else if, else", minutes: 30 },
    { file: "lesson-03-logic.html", title: "&&, ||, ! ו־truthy/falsy", minutes: 35 },
    { file: "lesson-04-ternary-switch.html", title: "ternary, switch ובדיקת קלט", minutes: 30 },
  ],
  glossary: [
    ["Condition", "קוֹנְדִישֶׁן", "תנאי — ביטוי שמחושב ל־`true` או `false`"],
    ["Comparison operator", "קוֹמְפֶּרִיזֶן", "סימן השוואה: `===`, `!==`, `<`, `>=`..."],
    ["Strict equality (===)", "סְטְרִיקְט", "שוויון מחמיר — אותו ערך <strong>ואותו סוג</strong>"],
    ["if / else", "אִיף / אֶלְס", "\"אם / אחרת\" — בחירה איזה קוד ירוץ"],
    ["Block", "בְּלוֹק", "קטע קוד בתוך `{ }`"],
    ["Logical operators", "לוֹגִ'יקַל", "`&&` (וגם), `||` (או), `!` (לא)"],
    ["Truth table", "טְרוּת׳ טֵייבְּל", "טבלת אמת — כל הצירופים של true/false והתוצאה"],
    ["Truthy / Falsy", "טְרוּתִ'י / פוֹלְסִי", "ערך שמתנהג כמו true/false בתוך תנאי"],
    ["Nullish coalescing (??)", "נַאלִיש", "ערך ברירת מחדל רק כשהערך `null` או `undefined`"],
    ["Ternary", "טֶרְנֶרִי", "תנאי מקוצר: `cond ? a : b`"],
    ["switch", "סְוִויץ'", "בחירה בין הרבה ערכים אפשריים של משתנה אחד"],
    ["Guard clause", "גַארְד קְלוֹז", "בדיקה בתחילת הקוד שעוצרת מוקדם כשהקלט לא תקין"],
    ["Edge case", "אֶדְג' קֵייס", "מקרה קצה — קלט גבולי (0, ריק, שלילי, בדיוק על הגבול)"],
  ],
  passTest: `<ul class="check">
<li>לכתוב בדיקת קלט שמחזירה הודעה מתאימה לקלט ריק, לא מספרי, שלילי או גדול מדי.</li>
<li>למלא טבלת אמת לביטוי עם שני תנאים ו־<code>!</code>.</li>
<li>להסביר למה <code>if (quantity)</code> הוא באג כשכמות 0 חוקית — ולתקן.</li>
<li>לבחור בין <code>if/else if</code>, ternary ו־<code>switch</code> לבעיה נתונה ולנמק.</li>
<li>80% מ־P03-E01–E19, ולפחות תרגיל תיקון אחד (E20–E23).</li>
</ul>`,
};
