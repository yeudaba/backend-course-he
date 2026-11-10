import { copyStep } from "../../lib.mjs";

export default {
  num: 12,
  code: "12",
  title: "מודלים ותכנון קוד",
  part: "חטיבה ב׳ — TypeScript ו־Node.js",
  checker: true,
  time: "4 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> כל מה שמפרק 11 (TypeScript בתיקיית הקורס).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("12-design")}
<p><strong>✔ בדיקה:</strong> <code>npx tsc -v</code> מציג גרסה 5.x.</p>`,
  goals: [
    "לכתוב מחלקות (class): שדות, constructor, מתודות, שדות פרטיים, getters ו־static.",
    "ליצור סוגי שגיאות משלך עם `extends Error`.",
    "להגדיר חוזה עם `interface` ולממש אותו בכמה מחלקות.",
    "להפריד אחריות: מודל, repository ו־service — ולהזריק תלויות מבחוץ.",
    "להבין את הגבול בין טיפוסים לבין validation בזמן ריצה.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרויקט 1 חילקת את הקוד לשלוש שכבות. בשרת אמיתי יש עשרות "ישויות" (משתמש, מוצר, הזמנה) ומאות פונקציות. בלי מבנה ברור — כל שינוי שובר משהו במקום אחר. הפרק הזה מלמד את אבני הבניין של המבנה הזה: מחלקות, חוזים (interfaces), ו"מי אחראי על מה". זה בדיוק המבנה של NestJS (פרק 20) — אחרי הפרק הזה הוא ייראה מוכר.</p>`,
  lessons: [
    { file: "lesson-01-classes.html", title: "מחלקות", minutes: 40 },
    { file: "lesson-02-errors-inheritance.html", title: "שגיאות משלך, ירושה והרכבה", minutes: 30 },
    { file: "lesson-03-repository-service.html", title: "interface, repository, service והזרקת תלויות", minutes: 45 },
    { file: "lesson-04-boundary.html", title: "גישור: טיפוסים מול בדיקה בזמן ריצה", minutes: 25, note: "יחידת גישור" },
  ],
  glossary: [
    ["Class", "קְלָאס", "מחלקה — תבנית ליצירת אובייקטים עם נתונים ומתודות"],
    ["Instance", "אִינְסְטַנְס", "מופע — אובייקט שנוצר ממחלקה עם `new`"],
    ["Constructor", "קוֹנְסְטְרַקְטוֹר", "פונקציה שרצה ביצירת מופע ומאתחלת אותו"],
    ["this", "דִיס", "המופע הנוכחי, בתוך מתודה"],
    ["Private field (#)", "פְּרַייבֶט", "שדה שאי אפשר לגשת אליו מחוץ למחלקה"],
    ["Getter", "גֶטֶר", "\"שדה מחושב\": `get total()`"],
    ["static", "סְטָטִיק", "שייך למחלקה עצמה, לא למופע"],
    ["Inheritance (extends)", "אִינְהֶרִיטַנְס", "ירושה — מחלקה שמרחיבה מחלקה אחרת"],
    ["Composition", "קוֹמְפּוֹזִישֶׁן", "הרכבה — אובייקט שמחזיק אובייקטים אחרים ומשתמש בהם"],
    ["implements", "אִימְפְּלֶמֶנְטְס", "\"המחלקה מקיימת את החוזה\" של interface"],
    ["Repository", "רִיפּוֹזִיטוֹרִי", "שכבה שאחראית רק על שמירה ושליפה של נתונים"],
    ["Service", "סֶרְבִיס", "שכבה שמכילה את החוקים העסקיים"],
    ["Dependency injection", "דִיפֶּנְדֶנְסִי אִינְג'ֶקְשֶׁן", "הזרקת תלויות — מקבלים את מה שצריך מבחוץ במקום ליצור לבד"],
    ["DTO", "דִי־טִי־אוֹ", "Data Transfer Object — הצורה של נתונים שעוברים בין שכבות/ברשת"],
  ],
  passTest: `<ul class="check">
<li>לכתוב מחלקה עם שדה פרטי, מתודות ו־getter, ולהסביר מתי מחלקה ומתי פונקציות ואובייקטים פשוטים.</li>
<li>להגדיר <code>NotFoundError</code> ו־<code>ValidationError</code> ולתפוס כל אחת לחוד עם <code>instanceof</code>.</li>
<li>לכתוב <code>interface</code> ל־repository, שני מימושים (זיכרון ו"מזויף לבדיקות"), ו־service שעובד עם שניהם בלי שינוי.</li>
<li>להסביר למה <code>body: CreateOrderDto</code> לא מגן מקלט זדוני, ומה כן.</li>
<li><code>npm run check P12</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
