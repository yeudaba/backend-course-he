import { copyStep } from "../../lib.mjs";

export default {
  num: 17,
  code: "17",
  title: "קשרים ושאילתות",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  database: true,
  time: "5 מפגשים",
  expectedExercises: 80,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> PostgreSQL, מסד <code>course</code>, קובץ <code>.env</code> והתוסף של VS Code (פרק 16).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום. רק טוענים את נתוני הפרק:</p>
${copyStep("17-relations")}
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>psql -d course -f 17-relations/files/store.sql</pre>
<p>(הקובץ יוצר טבלאות חדשות לצד אלה של פרק 16; <code>products</code> ו־<code>customers</code> נבנות מחדש במבנה של הפרק הזה. רוצה לחזור לנתונים של פרק 16? טען שוב את <code>16-sql/files/shop.sql</code>.)</p>
<p><strong>✔ בדיקה:</strong> <code>psql -d course -c "select count(*) from orders"</code> ← <code>12</code>.</p>`,
  goals: [
    "לתכנן טבלאות קשורות: מפתח ראשי, foreign key, יחס של אחד־לרבים ורבים־לרבים.",
    "לשלב טבלאות עם JOIN (INNER ו־LEFT) — ולהבין מתי נעלמות שורות.",
    "לקבץ ולסכם עם GROUP BY ו־HAVING.",
    "לכתוב תת־שאילתות, CTE (WITH) ו־EXISTS.",
    "פונקציות חלון בסיסיות: \"הכי טוב בכל קבוצה\" וסכום מצטבר.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרק 16 כל טבלה עמדה לבד. בעולם האמיתי: לקוח ← הזמנות ← פריטים ← מוצרים ← קטגוריות. כמעט כל endpoint שתכתוב ("ההזמנות שלי עם הסכום", "המוצרים הנמכרים החודש") הוא JOIN עם GROUP BY. וזה גם לב שאלות ה־SQL בראיונות: "לקוחות שלא הזמינו אף פעם", "המוצר הנמכר בכל קטגוריה", "ההכנסה לפי חודש".</p>`,
  lessons: [
    { file: "lesson-01-keys.html", title: "מפתחות וקשרים בין טבלאות", minutes: 35 },
    { file: "lesson-02-joins.html", title: "JOIN: לשלב טבלאות", minutes: 45 },
    { file: "lesson-03-group-by.html", title: "GROUP BY ו־HAVING", minutes: 40 },
    { file: "lesson-04-subqueries.html", title: "תת־שאילתות, WITH ופונקציות חלון", minutes: 45 },
  ],
  glossary: [
    ["Foreign key", "פוֹרִין קִי", "עמודה שמצביעה על מפתח ראשי בטבלה אחרת — והמסד מוודא שהוא קיים"],
    ["One-to-many", "וָואן טוּ מֶנִי", "לקוח אחד ← הרבה הזמנות"],
    ["Many-to-many", "מֶנִי טוּ מֶנִי", "הזמנה ↔ מוצרים — דרך טבלת קישור (order_items)"],
    ["Normalization", "נוֹרְמָלִיזַצְיָה", "לא לשכפל נתונים: שם הקטגוריה נשמר פעם אחת"],
    ["JOIN", "ג'וֹיְן", "שילוב שורות משתי טבלאות לפי תנאי"],
    ["INNER / LEFT JOIN", "אִינֶר / לֶפְט", "רק שורות עם התאמה / כל השורות מהשמאלית, גם בלי התאמה"],
    ["GROUP BY", "גְרוּפּ בַּיי", "חלוקה לקבוצות, וצבירה לכל קבוצה"],
    ["HAVING", "הֶבִינְג", "סינון אחרי הקיבוץ (WHERE — לפני)"],
    ["Subquery", "סַאבְּקְוֶורִי", "שאילתה בתוך שאילתה"],
    ["CTE", "סִי־טִי־אִי", "WITH name AS (...) — תת־שאילתה עם שם"],
    ["Window function", "וִינְדוֹאוּ", "חישוב על קבוצת שורות בלי לכווץ אותן: ROW_NUMBER, SUM ... OVER"],
  ],
  passTest: `<ul class="check">
<li>לצייר את הקשרים בין 5 הטבלאות של הפרק, ולהסביר למה <code>unit_price</code> נמצא ב־order_items ולא נלקח מ־products.</li>
<li>לכתוב "לקוחות שלא הזמינו אף פעם" בשתי דרכים (LEFT JOIN ו־NOT EXISTS).</li>
<li>הכנסה לפי חודש ולפי קטגוריה, רק מהזמנות שלא בוטלו.</li>
<li>להסביר מה ההבדל בין WHERE ל־HAVING, ובין <code>COUNT(*)</code> ל־<code>COUNT(o.id)</code> אחרי LEFT JOIN.</li>
<li>"המוצר הנמכר ביותר בכל קטגוריה" עם ROW_NUMBER.</li>
<li><code>npm run check P17</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
