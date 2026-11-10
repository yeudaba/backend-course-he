import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 6,
  code: "06",
  title: "מערכים",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  checker: true,
  time: "4 מפגשים (במסלול המהיר: 2)",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, Error Lens, Prettier, והבודק האוטומטי (פרק 5).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("06-arrays")}
${verifyNode}
<p><strong>✔ הבודק עובד?</strong> <code>npm run check P06-E06</code> צריך להציג בדיקות שנכשלות (עוד לא פתרת).</p>`,
  entryTest: `<ol>
<li>מה ידפיס: <code>const a = [10, 20, 30]; console.log(a[1], a.length, a[3]);</code></li>
<li>מה ההבדל בין <code>push</code> ל־<code>unshift</code>?</li>
<li>כתוב בשורה אחת: מערך חדש שבו כל מחיר ב־<code>prices</code> כפול 1.18.</li>
<li>כתוב בשורה אחת: רק המספרים הזוגיים מתוך <code>nums</code>.</li>
<li>מה מחזיר <code>[5, 8, 12].find((x) =&gt; x &gt; 6)</code>? ומה <code>[5].find((x) =&gt; x &gt; 6)</code>?</li>
<li>כתוב עם <code>reduce</code>: סכום של <code>nums</code>.</li>
<li>מה ידפיס: <code>console.log([10, 1, 5, 100].sort());</code> — ולמה?</li>
<li>מה ההבדל בין <code>slice</code> ל־<code>splice</code>?</li>
<li>מה ידפיס: <code>"a,b,c".split(",").join(" | ")</code>?</li>
<li>מה המשמעות של <code>const list = [1]; list.push(2);</code> — זה חוקי? ו־<code>list = [3]</code>?</li>
</ol>
<details><summary>תשובות</summary><div><ol>
<li><code>20 3 undefined</code></li>
<li><code>push</code> מוסיף לסוף, <code>unshift</code> להתחלה.</li>
<li><code>prices.map((p) =&gt; p * 1.18)</code></li>
<li><code>nums.filter((n) =&gt; n % 2 === 0)</code></li>
<li><code>8</code>; <code>undefined</code></li>
<li><code>nums.reduce((sum, n) =&gt; sum + n, 0)</code></li>
<li><code>[1, 10, 100, 5]</code> — <code>sort</code> בלי פונקציה ממיין כמחרוזות. צריך <code>(a, b) =&gt; a - b</code>.</li>
<li><code>slice</code> מחזיר עותק של חלק ולא משנה; <code>splice</code> משנה את המערך (מוחק/מכניס).</li>
<li><code>a | b | c</code></li>
<li><code>push</code> חוקי — <code>const</code> מונע הצבה חדשה, לא שינוי תוכן. <code>list = [3]</code> ← <code>TypeError</code>.</li>
</ol>
<p><strong>8 ומעלה:</strong> קופסאות ⚡ בלבד, ותרגילים P06-E13–E25. <strong>פחות:</strong> הפרק המלא.</p></div></details>`,
  goals: [
    "ליצור מערך, לקרוא ולשנות איברים לפי אינדקס, ולהוסיף/להסיר איברים.",
    "לעבור על מערך עם `for` ו־`for...of`, ולהשתמש בדפוסי צבירה מפרק 4.",
    "להשתמש ב־`map`, `filter`, `find`, `some`, `every`, `reduce`, `sort`.",
    "להבחין בין מתודות שמשנות את המערך לבין כאלה שמחזירות מערך חדש.",
    "להמיר בין מחרוזת למערך עם `split` ו־`join`.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>ב־P01-E24 היו לך <code>item1Price</code>, <code>item2Price</code>... — ובפרק 4 פירקת ידנית טקסט כמו <code>"10,20,30"</code>. כל רשימה בשרת היא מערך: המוצרים בעגלה, ההזמנות של היום, תוצאות חיפוש. API שמחזיר "רשימת משתמשים" מחזיר מערך. הפרק הזה הוא כנראה החשוב ביותר בחטיבה.</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "מערך: יצירה, אינדקס, הוספה והסרה", minutes: 30 },
    { file: "lesson-02-looping.html", title: "מעבר על מערך, split ו־join", minutes: 30 },
    { file: "lesson-03-map-filter.html", title: "map, filter, find, some, every", minutes: 35 },
    { file: "lesson-04-reduce-sort.html", title: "reduce, sort, ומה משנה את המערך", minutes: 35 },
  ],
  glossary: [
    ["Array", "אַרֵיי", "מערך — רשימה מסודרת של ערכים: `[10, 20, 30]`"],
    ["Element / Item", "אֶלֶמֶנְט / אַייטֶם", "איבר — ערך אחד במערך"],
    ["Index", "אִינְדֶקְס", "מיקום של איבר, מתחיל מ־0"],
    ["push / pop", "פּוּש / פּוֹפּ", "הוספה / הסרה בסוף המערך"],
    ["unshift / shift", "אַנְשִׁיפְט / שִׁיפְט", "הוספה / הסרה בהתחלה"],
    ["map", "מֶאפּ", "מערך חדש שבו כל איבר עבר פונקציה"],
    ["filter", "פִילְטֶר", "מערך חדש רק עם האיברים שעברו בדיקה"],
    ["find", "פַיינְד", "האיבר הראשון שעובר בדיקה (או `undefined`)"],
    ["some / every", "סָאם / אֶבְרִי", "האם לפחות אחד / כולם עוברים בדיקה"],
    ["reduce", "רִידְיוּס", "\"מכווץ\" מערך לערך אחד (סכום, מקסימום...)"],
    ["Comparator", "קוֹמְפֶּרֵייטוֹר", "פונקציה שאומרת ל־`sort` מי לפני מי: `(a, b) => a - b`"],
    ["Mutate", "מְיוּטֵייט", "לשנות את המקור. `push`, `sort`, `splice` משנים; `map`, `filter`, `slice` לא"],
    ["split / join", "סְפְּלִיט / ג'וֹיְן", "מחרוזת ← מערך / מערך ← מחרוזת"],
    ["Spread (...)", "סְפְּרֶד", "\"פריסה\" של איברים: `[...arr]` יוצר עותק"],
  ],
  passTest: `<ul class="check">
<li>לכתוב בלי עזרה: סינון, המרה וסכום של מערך מספרים — פעם עם לולאה ופעם עם <code>filter</code>/<code>map</code>/<code>reduce</code>.</li>
<li>למיין מספרים ומחרוזות נכון, ולהסביר למה <code>[10, 1, 5].sort()</code> שגוי.</li>
<li>להסביר איזו מתודה משנה את המקור ואיזו מחזירה חדש, ולתת דוגמה לבאג שזה גורם.</li>
<li>להמיר <code>"a, b , c"</code> למערך נקי ובחזרה.</li>
<li><code>npm run check P06</code>: לפחות 80% מ־E06–E19, ולפחות תרגיל תיקון אחד (E20–E23).</li>
</ul>`,
};
