import { copyStep } from "../../lib.mjs";

export default {
  num: 18,
  code: "18",
  title: "עקביות וביצועים",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  database: true,
  time: "5 מפגשים",
  expectedExercises: 81,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> PostgreSQL, מסד <code>course</code>, <code>.env</code> (פרק 16).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום. טוענים את נתוני הפרק (כמה שניות — יש בהם 200,000 שורות):</p>
${copyStep("18-consistency")}
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>psql -d course -f 18-consistency/files/bank.sql</pre>
<p>בשיעור 2 תצטרך <strong>שני</strong> חלונות psql במקביל: בפאנל של ה־Terminal ב־VS Code, כפתור הפיצול (▥) — ובכל חצי <code>psql -d course</code>.</p>
<p><strong>✔ בדיקה:</strong> <code>psql -d course -c "select count(*) from big_orders"</code> ← <code>200000</code>.</p>`,
  goals: [
    "להשתמש ב־transaction כדי שכמה פעולות יקרו יחד — או אף אחת.",
    "לזהות race condition, ולמנוע אותו: עדכון אטומי, FOR UPDATE, אילוצים, ניסיון חוזר.",
    "להבין index: מה הוא, מתי עוזר, מתי מזיק — ולקרוא EXPLAIN.",
    "להכיר שתי בעיות ביצועים קלאסיות: N+1 ו־OFFSET גדול.",
    "לעבוד עם transactions מתוך Node, עם הספרייה pg.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>עד עכשיו כל שאילתה רצה לבד. בשרת אמיתי מאות בקשות רצות <em>במקביל</em> — ושני לקוחות שקונים את הפריט האחרון באותה שנייה הם לא תרחיש תיאורטי. גם "השאילתה עבדה מהר בפיתוח" ו"בייצור היא לוקחת 4 שניות" — זה תמיד יקרה כשהטבלה תגדל. הפרק הזה הוא ההבדל בין "כתבתי שאילתה שעובדת" ל"כתבתי שאילתה שעובדת גם כשיש לחץ". זו גם הדרישה המרכזית בפרויקט הדגל: מלאי לא יורד מתחת לאפס, גם במרוץ.</p>`,
  lessons: [
    { file: "lesson-01-transactions.html", title: "Transactions: הכול או כלום", minutes: 40 },
    { file: "lesson-02-concurrency.html", title: "מקביליות ו־race conditions", minutes: 50 },
    { file: "lesson-03-indexes.html", title: "Indexes ו־EXPLAIN", minutes: 45 },
    { file: "lesson-04-performance.html", title: "N+1 ו־pagination מהירה", minutes: 30 },
  ],
  glossary: [
    ["Transaction", "טְרַנְזַקְצְיָה", "קבוצת פעולות שמתבצעות יחד או לא בכלל"],
    ["Commit / Rollback", "קוֹמִיט / רוֹלְבֶּק", "אישור השינויים / ביטול שלהם"],
    ["ACID", "אֵסִיד", "Atomicity, Consistency, Isolation, Durability — ההבטחות של transaction"],
    ["Race condition", "רֵייס קוֹנְדִישֶׁן", "באג שתלוי בתזמון בין שתי פעולות במקביל"],
    ["Lock", "לוֹק", "נעילה — שורה \"תפוסה\" עד סוף ה־transaction"],
    ["Isolation level", "אַיְיסוֹלֵיישֶׁן", "כמה transactions מבודדים זה מזה: Read Committed, Repeatable Read, Serializable"],
    ["Deadlock", "דֶד־לוֹק", "שני transactions מחכים זה לזה לנצח (המסד מבטל אחד)"],
    ["Index", "אִינְדֶקְס", "מבנה נתונים שמאפשר למצוא שורות בלי לסרוק את כל הטבלה"],
    ["EXPLAIN", "אֶקְסְפְּלֵיין", "מציג איך המסד מתכנן להריץ שאילתה"],
    ["Seq Scan / Index Scan", "סִיק סְקֶן / אִינְדֶקְס סְקֶן", "סריקת כל הטבלה / קפיצה ישירה דרך index"],
    ["N+1", "אֶן פְּלוּס וָואן", "שאילתה אחת לרשימה + שאילתה לכל פריט — במקום 2 שאילתות"],
    ["Keyset pagination", "קִי־סֶט", "\"תן לי 20 אחרי id X\" — במקום OFFSET"],
  ],
  passTest: `<ul class="check">
<li>לכתוב העברת כספים ב־transaction מתוך Node, עם ROLLBACK בכל שגיאה ושחרור החיבור.</li>
<li>להראות בשני חלונות psql איך שתי מכירות של הפריט האחרון יוצרות מלאי שלילי — ולתקן בשתי דרכים.</li>
<li>להסביר מתי index עוזר, מתי לא, ולמה לא שמים index על כל עמודה.</li>
<li>להוסיף index לשאילתה איטית ולהראות ב־EXPLAIN את ההבדל.</li>
<li>להסביר מה זה N+1 ואיך מזהים אותו ביומן השאילתות.</li>
<li><code>npm run check P18</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
