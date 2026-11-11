import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 7,
  code: "07",
  title: "אובייקטים",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  checker: true,
  time: "4 מפגשים (במסלול המהיר: 2)",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, והבודק האוטומטי.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("07-objects")}
${verifyNode}`,
  entryTest: `<ol>
<li>מה ידפיס: <code>const p = { name: "עט", price: 5 }; console.log(p.price, p["name"], p.color);</code></li>
<li>מה ידפיס: <code>const a = { n: 1 }; const b = a; b.n = 2; console.log(a.n);</code></li>
<li>מה ידפיס: <code>console.log({ n: 1 } === { n: 1 });</code></li>
<li>כתוב: מערך <code>products</code> של אובייקטים עם <code>price</code> — סכום כל המחירים.</li>
<li>מה עושה <code>user?.address?.city</code>?</li>
<li>כתוב עם destructuring: הוצא <code>name</code> ו־<code>age</code> מ־<code>user</code> למשתנים.</li>
<li>מה ההבדל בין <code>{ ...obj }</code> ל־<code>structuredClone(obj)</code>?</li>
<li>מה מחזיר <code>JSON.stringify({ a: 1 })</code>, ומה הסוג שלו?</li>
<li>מתי עדיף <code>Map</code> על אובייקט רגיל לחיפוש?</li>
<li>איך מסירים כפילויות ממערך בשורה אחת?</li>
</ol>
<details><summary>תשובות</summary><div><ol>
<li><code>5 עט undefined</code></li>
<li><code>2</code> — שני המשתנים מצביעים על אותו אובייקט.</li>
<li><code>false</code> — שני אובייקטים שונים, גם אם התוכן זהה.</li>
<li><code>products.reduce((s, p) =&gt; s + p.price, 0)</code></li>
<li>ניגש בבטחה: אם משהו בדרך הוא <code>null</code>/<code>undefined</code> — מחזיר <code>undefined</code> במקום לקרוס.</li>
<li><code>const { name, age } = user;</code></li>
<li>spread מעתיק רק את הרמה הראשונה (אובייקטים פנימיים משותפים); <code>structuredClone</code> — עותק עמוק מלא.</li>
<li><code>'{"a":1}'</code> — מחרוזת.</li>
<li>כשהמפתחות דינמיים (מזהים, אימיילים), כשיש הרבה הוספות/מחיקות, או כשהמפתח לא מחרוזת.</li>
<li><code>[...new Set(arr)]</code></li>
</ol>
<p><strong>8 ומעלה:</strong> קופסאות ⚡ ושיעור 4 (Map, Set וגישור), ותרגילים P07-E13–E25. <strong>פחות:</strong> הפרק המלא.</p></div></details>`,
  goals: [
    "לייצג \"דבר\" (משתמש, מוצר, הזמנה) כאובייקט עם שדות, ולגשת אליהם בבטחה.",
    "לעבוד עם מערך של אובייקטים: חיפוש, סינון, מיון לפי שדה, סכומים.",
    "להבין הפניות: מתי שני משתנים הם אותו אובייקט, ואיך מעתיקים נכון.",
    "להשתמש ב־destructuring, spread, `Object.entries` ו־JSON.",
    "להשתמש ב־`Map` ו־`Set` כדי לחבר נתונים מקושרים במהירות.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>ב־P06-E24 החזקת שלושה מערכים מקבילים ליום: שם, הזמנות, הכנסה — ו־<code>revenue[i]</code> בכל מקום. אובייקט מאגד את כל המידע על "דבר אחד" יחד: <code>{ day: "ראשון", orders: 12, revenue: 1840 }</code>. כל מה שעובר בין שרת ללקוח ב־API הוא אובייקטים (בפורמט JSON), וכל שורה במסד נתונים הופכת בקוד לאובייקט. זה הפרק שבו הקוד שלך מתחיל להיראות כמו קוד של שרת.</p>`,
  lessons: [
    { file: "lesson-01-objects.html", title: "אובייקט: שדות, גישה ושינוי", minutes: 30 },
    { file: "lesson-02-arrays-of-objects.html", title: "מערך של אובייקטים", minutes: 35 },
    { file: "lesson-03-references.html", title: "הפניות, העתקה, destructuring ו־JSON", minutes: 40 },
    { file: "lesson-04-map-set.html", title: "Map, Set וגישור: נתונים מקושרים", minutes: 35, note: "כולל יחידת גישור" },
  ],
  glossary: [
    ["Object", "אוֹבְּיֶקְט", "אובייקט — אוסף של שדות עם שמות: `{ name: \"דנה\", age: 31 }`"],
    ["Property / Key", "פְּרוֹפֶּרְטִי / קִי", "שדה / מפתח — השם של ערך בתוך אובייקט"],
    ["Value", "וַולְיוּ", "הערך של השדה"],
    ["Dot notation", "דוֹט", "גישה עם נקודה: `user.name`"],
    ["Bracket notation", "בְּרָאקֶט", "גישה עם סוגריים מרובעים: `user[\"name\"]` או `user[key]`"],
    ["Optional chaining (?.)", "אוֹפְּשֶׁנַל צֵ'יינִינְג", "גישה בטוחה: `a?.b` מחזיר `undefined` במקום לקרוס"],
    ["Reference", "רֶפֶרֶנְס", "הפניה — משתנה שמצביע על אובייקט, לא מכיל עותק שלו"],
    ["Shallow copy", "שָׁאלוֹ", "עותק רדוד — רק הרמה הראשונה (`{ ...obj }`)"],
    ["Deep copy", "דִיפּ", "עותק עמוק — הכול, כולל אובייקטים פנימיים (`structuredClone`)"],
    ["Destructuring", "דִיסְטְרַקְצֶ'רִינְג", "פירוק: `const { name } = user;`"],
    ["JSON", "ג'ֵייסוֹן", "פורמט טקסט לאובייקטים — השפה שבה שרתים מדברים"],
    ["Map", "מֶאפּ", "מבנה של מפתח ← ערך, עם חיפוש מהיר"],
    ["Set", "סֶט", "אוסף ערכים ייחודיים (בלי כפילויות)"],
  ],
  passTest: `<ul class="check">
<li>לכתוב בלי עזרה פונקציה שמקבלת מערך הזמנות (אובייקטים) ומחזירה את סכום ההזמנות ששולמו.</li>
<li>לצייר "קופסאות והפניות" לקוד שבו שני משתנים מצביעים על אותו אובייקט, ולהסביר את הבאג.</li>
<li>לעדכן שדה באובייקט <strong>בלי לשנות את המקור</strong> (spread).</li>
<li>להמיר אובייקט ל־JSON ובחזרה, ולהסביר מה קורה לפונקציות ולתאריכים.</li>
<li>לחבר שני מערכים (הזמנות ולקוחות) לפי מזהה עם <code>Map</code>.</li>
<li><code>npm run check P07</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
