import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 2,
  code: "02",
  title: "פעולות ומחרוזות",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  time: "3 מפגשים (במסלול המהיר: 1–2)",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, Error Lens.</p>
<p><strong>מה מתקינים עכשיו:</strong> תוסף <strong>Prettier</strong> — מסדר את הקוד אוטומטית (רווחים, הזחות, מירכאות) בכל שמירה.</p>
<ol class="steps">
<li>Extensions (<kbd>⌘</kbd>+<kbd>⇧</kbd>+<kbd>X</kbd>) ← חפש <code>Prettier - Code formatter</code> ← ודא שהמזהה הוא <code>esbenp.prettier-vscode</code> ← Install. (<a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode" target="_blank">עמוד התוסף</a>)</li>
<li><kbd>⌘</kbd>+<kbd>,</kbd> (הגדרות) ← חפש <code>default formatter</code> ← בחר <strong>Prettier - Code formatter</strong>.</li>
<li>בהגדרות חפש <code>format on save</code> ← סמן ✔ את <strong>Editor: Format On Save</strong>.</li>
<li>בדיקה: כתוב בקובץ <code>.js</code> את השורה <code>console.log(  "x"   )</code> ושמור — הרווחים המיותרים ייעלמו.</li>
</ol>
${copyStep("02-operators-strings")}
${verifyNode}`,
  entryTest: `<p>10 שאלות, בלי להריץ (~15 דקות):</p>
<ol>
<li><code>console.log(2 + 3 * 4);</code></li>
<li><code>console.log(17 % 5);</code></li>
<li><code>let n = 10; n += 5; n++; console.log(n);</code></li>
<li><code>console.log("5" + 3);</code></li>
<li><code>console.log("5" * 3);</code></li>
<li>כתוב בעזרת template literal: <code>שלום, דנה! יש לך 3 הודעות</code> — כשהשם והמספר במשתנים <code>name</code> ו־<code>count</code>.</li>
<li><code>console.log("backend".length);</code></li>
<li><code>console.log("Node".toUpperCase());</code></li>
<li><code>console.log(Number("12abc"));</code></li>
<li><code>console.log((9.5).toFixed(2));</code> — ומה <code>typeof</code> של התוצאה?</li>
</ol>
<details><summary>תשובות</summary><div>
<ol>
<li><code>14</code> — כפל לפני חיבור.</li>
<li><code>2</code> — שארית החלוקה.</li>
<li><code>16</code></li>
<li><code>53</code> — חיבור עם מחרוזת הופך לחיבור טקסט.</li>
<li><code>15</code> — כפל ממיר למספר.</li>
<li><code>&#96;שלום, \${name}! יש לך \${count} הודעות&#96;</code></li>
<li><code>7</code></li>
<li><code>NODE</code></li>
<li><code>NaN</code></li>
<li><code>9.50</code>, וה־<code>typeof</code> הוא <code>string</code>.</li>
</ol>
<p><strong>8 ומעלה:</strong> קרא רק את קופסאות ⚡ ואת שיעור 4 (קריאת ביטויים), ופתור P02-E13 עד P02-E25. <strong>פחות:</strong> הפרק המלא.</p>
</div></details>`,
  goals: [
    "לחשב עם `+ - * / % **` ולדעת באיזה סדר JavaScript מחשבת.",
    "לקצר עדכונים עם `+=`, `-=`, `++`.",
    "לבנות טקסט עם template literals: <code>&#96;שלום ${name}&#96;</code>.",
    "להשתמש במתודות מחרוזת: `length`, `toUpperCase`, `trim`, `includes`, `slice`, `replaceAll`.",
    "להמיר בין טקסט למספר, ולזהות `NaN` והמרות אוטומטיות מסוכנות.",
    "לקרוא ביטוי מורכב צעד אחר צעד ולנבא את התוצאה.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>כמעט כל בקשה לשרת כוללת חישוב או טקסט: לחשב מחיר עם מע״מ, לבנות הודעת "ההזמנה שלך נשלחה", לנקות רווחים ממייל שהמשתמש הקליד, להמיר <code>"3"</code> שהגיע מטופס למספר 3. הפרק הזה הוא ארגז הכלים לזה.</p>`,
  lessons: [
    { file: "lesson-01-arithmetic.html", title: "חשבון וסדר פעולות", minutes: 30 },
    { file: "lesson-02-strings.html", title: "מחרוזות ו־template literals", minutes: 35 },
    { file: "lesson-03-conversions.html", title: "המרות, NaN ומלכודות", minutes: 25 },
    { file: "lesson-04-reading-expressions.html", title: "גישור: קריאת ביטוי צעד אחר צעד", minutes: 20, note: "יחידת גישור" },
  ],
  glossary: [
    ["Operator", "אוֹפֶּרֵייטוֹר", "סימן פעולה: `+`, `-`, `*`, `/`, `%`"],
    ["Expression", "אֶקְסְפְּרֶשֶׁן", "ביטוי — כל קטע קוד שמחושב לערך: `price * 2`"],
    ["Precedence", "פְּרֶסִידֶנְס", "קדימות — איזו פעולה מחושבת קודם"],
    ["Remainder (%)", "רִימֵיינְדֶר", "שארית חלוקה: `7 % 3` הוא `1`"],
    ["Increment", "אִינְקְרֶמֶנְט", "הגדלה ב־1: `count++`"],
    ["Concatenation", "קוֹנְקָטֵנֵיישֶׁן", "שרשור — חיבור מחרוזות"],
    ["Template literal", "טֶמְפְּלֵייט לִיטֶרַל", "מחרוזת בגרש הפוך שאפשר לשבץ בה ערכים עם `${...}`"],
    ["Method", "מֶתוֹד", "פעולה שמחוברת לערך, נקראת עם נקודה וסוגריים: `name.trim()`"],
    ["Property", "פְּרוֹפֶּרְטִי", "תכונה של ערך, בלי סוגריים: `name.length`"],
    ["Index", "אִינְדֶקְס", "מיקום של תו (או איבר), מתחיל מ־0"],
    ["NaN", "נָאן", "Not a Number — תוצאה של חישוב/המרה שנכשלו"],
    ["Type coercion", "קוֹאֶרְשֶׁן", "המרה אוטומטית של סוג, למשל `\"5\" * 2`"],
  ],
  passTest: `<p>אתה מוכן לפרק 3 אם אתה יכול, בלי להסתכל:</p>
<ul class="check">
<li>לנבא את התוצאה של <code>10 + 4 * 2 - 6 / 3</code> ושל <code>"10" + 4 * 2</code>, ולהסביר צעד אחר צעד.</li>
<li>לכתוב template literal שמשלב 3 משתנים וחישוב.</li>
<li>לנקות קלט: רווחים מסביב, אותיות קטנות — ולבדוק אם הוא מכיל <code>@</code>.</li>
<li>להמיר <code>"49.90"</code> למספר, להוסיף לו מע״מ ולהציג עם שתי ספרות אחרי הנקודה.</li>
<li>80% מתרגילים P02-E01–E19, ולפחות תרגיל תיקון אחד (E20–E23).</li>
</ul>`,
};
