import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 4,
  code: "04",
  title: "לולאות",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  time: "3 מפגשים (במסלול המהיר: 1–2)",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, Error Lens, Prettier.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("04-loops")}
${verifyNode}
<p><strong>⌨️ קיצור שחשוב בפרק הזה:</strong> <kbd>Ctrl</kbd> + <kbd>C</kbd> ב־Terminal עוצר תוכנית שנתקעה בלולאה אינסופית.</p>`,
  entryTest: `<ol>
<li>כמה פעמים תרוץ הלולאה: <code>for (let i = 0; i &lt; 5; i++)</code>?</li>
<li>מה ידפיס: <code>let s = 0; for (let i = 1; i &lt;= 4; i++) { s += i; } console.log(s);</code></li>
<li>כתוב לולאה שמדפיסה 10, 8, 6, 4, 2.</li>
<li>מה ההבדל בין <code>break</code> ל־<code>continue</code>?</li>
<li>מה ידפיס: <code>let n = 1; while (n &lt; 50) { n *= 3; } console.log(n);</code></li>
<li>כתוב לולאה שסופרת כמה פעמים האות <code>"a"</code> מופיעה ב־<code>"banana"</code>.</li>
<li>מה הבעיה: <code>let i = 0; while (i &lt; 3) { console.log(i); }</code></li>
<li>כמה פעמים תודפס המילה: <code>for (let r = 0; r &lt; 3; r++) { for (let c = 0; c &lt; 4; c++) { console.log("x"); } }</code></li>
<li>מה יקרה: <code>for (let i = 0; i &lt; 3; i++) {}</code> ואז <code>console.log(i);</code></li>
<li>איך מוצאים את המספר הגדול ביותר בלולאה (במילים)?</li>
</ol>
<details><summary>תשובות</summary><div><ol>
<li>5 (i = 0..4)</li>
<li><code>10</code></li>
<li><code>for (let i = 10; i &gt;= 2; i -= 2) { console.log(i); }</code></li>
<li><code>break</code> יוצא מהלולאה לגמרי; <code>continue</code> מדלג רק על הסיבוב הנוכחי.</li>
<li><code>81</code></li>
<li><code>let count = 0; for (const ch of "banana") { if (ch === "a") count++; }</code> ← 3</li>
<li>לולאה אינסופית — <code>i</code> לא גדל.</li>
<li>12</li>
<li><code>ReferenceError: i is not defined</code></li>
<li>משתנה "הכי גדול עד עכשיו", מתחיל מהאיבר הראשון; בכל סיבוב — אם הנוכחי גדול ממנו, מחליפים.</li>
</ol>
<p><strong>8 ומעלה:</strong> קרא רק קופסאות ⚡ ופתור P04-E13 עד P04-E25. <strong>פחות:</strong> הפרק המלא.</p></div></details>`,
  goals: [
    "לחזור על קוד עם `while` ועם `for`, ולעצור בזמן.",
    "לעקוב אחרי לולאה בטבלת מעקב — כולל הסיבוב האחרון.",
    "להשתמש בדפוסי צבירה: סכום, ספירה, מקסימום, בניית מחרוזת, דגל \"נמצא\".",
    "לשלוט בזרימה עם `break` ו־`continue`.",
    "לעבור על תווים של מחרוזת עם `for...of`, ולכתוב לולאות מקוננות.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>ב־P01-E24 (עגלת הקניות) כתבת אותו בלוק ארבע פעמים. ומה אם בעגלה 200 פריטים? או אם השרת צריך לעבור על 10,000 הזמנות כדי לחשב דוח יומי? לולאה כותבת את החזרה פעם אחת — ונותנת למחשב לחזור כמה שצריך.</p>`,
  lessons: [
    { file: "lesson-01-while.html", title: "while — חזור כל עוד", minutes: 25 },
    { file: "lesson-02-for.html", title: "for — לולאה עם מונה", minutes: 30 },
    { file: "lesson-03-patterns.html", title: "דפוסי צבירה, break ו־continue", minutes: 35 },
    { file: "lesson-04-nested-strings.html", title: "לולאות על מחרוזות ולולאות מקוננות", minutes: 30 },
  ],
  glossary: [
    ["Loop", "לוּפּ", "לולאה — קוד שחוזר על עצמו"],
    ["Iteration", "אִיטֶרֵיישֶׁן", "סיבוב אחד של הלולאה"],
    ["while", "וַוייל", "\"כל עוד\" — חוזר כל עוד התנאי `true`"],
    ["for", "פוֹר", "לולאה עם אתחול, תנאי וצעד בשורה אחת"],
    ["Counter", "קַאוּנְטֶר", "מונה — משתנה שסופר סיבובים (בדרך כלל `i`)"],
    ["Infinite loop", "אִינְפִינִיט לוּפּ", "לולאה אינסופית — התנאי לעולם לא נהיה `false`"],
    ["Accumulator", "אָקְיוּמְיוּלֵייטוֹר", "צובר — משתנה שאוסף תוצאה לאורך הלולאה (סכום, ספירה)"],
    ["break", "בְּרֵייק", "יציאה מיידית מהלולאה"],
    ["continue", "קוֹנְטִינְיוּ", "דילוג לסיבוב הבא"],
    ["Off-by-one", "אוֹף־בַּיי־וָואן", "טעות של סיבוב אחד מיותר או חסר (`<` במקום `<=`)"],
    ["for...of", "פוֹר אוֹף", "לולאה שעוברת על כל איבר (כאן: כל תו במחרוזת)"],
    ["Nested loop", "נֶסְטֶד לוּפּ", "לולאה בתוך לולאה"],
    ["Flag", "פְלֶאג", "דגל — בוליאני שזוכר \"האם קרה משהו\" (למשל `found`)"],
  ],
  passTest: `<ul class="check">
<li>למלא טבלת מעקב ללולאת <code>for</code> עם צובר, כולל הבדיקה שמסיימת אותה.</li>
<li>לכתוב בלי עזרה: סכום 1..n, ספירת תווים במחרוזת, מציאת מקסימום בין מספרים.</li>
<li>לזהות ולתקן לולאה אינסופית וטעות off-by-one.</li>
<li>להסביר מתי <code>while</code> ומתי <code>for</code>.</li>
<li>80% מ־P04-E01–E19, ולפחות תרגיל תיקון אחד (E20–E23).</li>
</ul>`,
};
