import { copyStep } from "../../lib.mjs";

export default {
  num: "P3",
  label: "פרויקט 3",
  title: "פרויקט הדגל: חנות ציוד קפה",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/coffee-shop"],
  nestProjects: ["solutions/coffee-shop"],
  testTimeout: 180000, // כל בודק מקים מסד, מריץ migrations ומעלה את השרת
  time: "3–4 שבועות",
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> הכול מפרקים 20–25: Node.js 24, PostgreSQL, Docker Desktop, חשבונות GitHub, Neon ו־Render.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום חדש. הפרויקט נבנה <strong>מאפס</strong>, ב־repo חדש (<code>~/dev/coffee-shop</code>), בלי להעתיק מפרויקט 2 — זה בדיוק מה שהוא מוכיח.</p>
${copyStep("25p-project-shop")}
<p><strong>✔ הבודק:</strong> "קופסה שחורה" — הוא לא מסתכל על הקוד שלך, רק מריץ אותו. לכל בדיקה: מסד חדש, <code>prisma migrate deploy</code> שלך, <code>node dist/main.js</code> שלך, ובקשות HTTP. לכן לפני כל בדיקה:</p>
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/coffee-shop &amp;&amp; npx prisma generate &amp;&amp; npm run build
<span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>npm run check PR3-AUTH -- --dir ~/dev/coffee-shop</pre>`,
  goals: [
    "לבנות מערכת שלמה מאפס, לבד: תכנון, מודל נתונים, API, בדיקות, Docker, CI ופריסה.",
    "נכונות תחת מקביליות: אין מלאי שלילי גם כששני לקוחות קונים את היחידה האחרונה באותו רגע.",
    "Idempotency, תשלום מדומה עם כישלון, ומכונת מצבים להזמנה.",
    "README שמראיין קורא: החלטות טכניות, תרשימים, קישור חי.",
  ],
  intro: `<h2>🤔 מה בונים</h2>
<p>חנות אונליין קטנה לציוד קפה. לקוחות מחפשים מוצרים, ממלאים עגלה, מזמינים ומשלמים (תשלום מדומה). מנהל מנהל קטלוג ומלאי, ושולח הזמנות. זה הפרויקט שתציג בראיונות — ולכן הוא נמדד בדיוק במה שמראיינים שואלים: מה קורה כששני אנשים קונים את הפריט האחרון? מה קורה כשהלקוח לוחץ פעמיים על "הזמן"? מה קורה כשהתשלום נכשל?</p>
<p><img src="files/shop-web.png" alt="דף ההדגמה של החנות: קטלוג, עגלה והזמנות" style="max-width:100%;border-radius:10px;border:1px solid var(--border)"></p>
<p>(צילום מסך אמיתי של הפתרון לדוגמה, רץ ב־<code>docker compose up</code>.)</p>`,
  lessons: [
    { file: "stage-0-plan.html", title: "תכנון: דרישות, חוזה ומודל נתונים", minutes: 60 },
    { file: "stage-1-catalog.html", title: "שלב 1: משתמשים ומוצרים", minutes: 240, note: "🤖 PR3-AUTH, PR3-PRODUCTS" },
    { file: "stage-2-orders.html", title: "שלב 2: עגלה, הזמנה ומרוץ על המלאי", minutes: 300, note: "🤖 PR3-ORDERS, PR3-RACE" },
    { file: "stage-3-payments.html", title: "שלב 3: Idempotency, תשלום, ביטול ומשלוח", minutes: 240, note: "🤖 PR3-PAY" },
    { file: "stage-4-ship.html", title: "שלב 4: בדיקות, Docker, CI, פריסה ו־README", minutes: 300, note: "🤖 PR3-SHIP" },
    { file: "reference.html", title: "פתרון לדוגמה והחלטות עיצוב", minutes: 45, note: "🔒 אחרי שסיימת" },
  ],
  glossary: [
    ["Snapshot (price)", "סְנַפְּשׁוֹט", "שמירת המחיר והשם בשורת ההזמנה — היסטוריה לא משתנה"],
    ["Conditional update", "קוֹנְדִישְׁנַל אַפְּדֵייט", "UPDATE ... WHERE stock >= n — בדיקה ושינוי בפעולה אטומית אחת"],
    ["Lost update", "לוֹסְט אַפְּדֵייט", "שתי פעולות קוראות אותו ערך, וכל אחת כותבת על השנייה"],
    ["State machine", "סְטֵייט מָשִׁין", "רשימת המצבים והמעברים המותרים ביניהם"],
    ["Soft delete", "סוֹפְט דִילִיט", "סימון \"לא פעיל\" במקום מחיקה — כדי שהיסטוריה לא תישבר"],
    ["Black-box test", "בְּלֶק בּוֹקְס", "בדיקה שמכירה רק את החוזה (HTTP), לא את הקוד"],
  ],
};
