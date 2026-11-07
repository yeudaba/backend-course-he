import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 1,
  code: "01",
  title: "ערכים ומשתנים",
  part: "חטיבה א׳ — יסודות JavaScript",
  fast: true,
  time: "2–3 מפגשים (במסלול המהיר: מפגש אחד)",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+ ותוסף Error Lens (פרק 0).</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("01-values-variables")}
${verifyNode}`,
  entryTest: `<p>זוכר את המושגים מהתואר? ענה על 10 השאלות <strong>בלי להריץ</strong> (~15 דקות), ואז פתח את התשובות.</p>
<ol>
<li>מה ידפיס <code>console.log(typeof "5");</code>?</li>
<li>מה ידפיס <code>console.log(typeof 5);</code>?</li>
<li>מה ההבדל בין <code>let</code> ל־<code>const</code>?</li>
<li>מה יקרה: <code>const a = 1; a = 2;</code></li>
<li>מה ידפיס: <code>let x; console.log(x);</code></li>
<li>כתוב משתנה שמחזיק את המחיר 49.9, בשם לפי המוסכמה של JavaScript ל"מחיר מוצר".</li>
<li>מה ידפיס <code>console.log("סכום:", 3 + 4);</code>?</li>
<li>מה ההבדל בין <code>null</code> ל־<code>undefined</code>?</li>
<li>מה ידפיס: <code>let n = 5; n = n + 1; console.log(n);</code></li>
<li>למה כמעט לא משתמשים היום ב־<code>var</code>?</li>
</ol>
<details><summary>תשובות</summary><div>
<ol>
<li><code>string</code> — המירכאות הופכות אותו לטקסט.</li>
<li><code>number</code></li>
<li><code>let</code> אפשר להציב בו ערך חדש; <code>const</code> — לא.</li>
<li><code>TypeError: Assignment to constant variable.</code></li>
<li><code>undefined</code></li>
<li><code>const productPrice = 49.9;</code> (camelCase)</li>
<li><code>סכום: 7</code></li>
<li><code>undefined</code> = "עוד לא קיבל ערך" (בדרך כלל JavaScript שמה אותו); <code>null</code> = "ריק בכוונה" (אנחנו שמים אותו).</li>
<li><code>6</code></li>
<li>יש לו התנהגות מבלבלת (תחום הכרזה רחב, אפשר להכריז שוב) — <code>let</code> ו־<code>const</code> מחליפים אותו.</li>
</ol>
<p><strong>8 ומעלה נכונות?</strong> מסלול מהיר: קרא רק את הקופסאות שמסומנות <strong>⚡</strong> בשיעורים, ופתור את תרגילי רמות 3–5 (P01-E13 עד P01-E25). <strong>פחות מ־8?</strong> עבור על הפרק המלא — זה ישתלם.</p>
</div></details>`,
  goals: [
    "להכיר את שלושת סוגי הערכים הבסיסיים: מחרוזת, מספר ובוליאני — ולבדוק סוג עם `typeof`.",
    "ליצור משתנים עם `const` ו־`let`, ולדעת מתי כל אחד.",
    "לעקוב אחרי ערכי משתנים שורה אחר שורה בטבלת מעקב.",
    "להבין את `undefined` ואת `null`, ולמה לא משתמשים ב־`var`.",
    "לקרוא את השגיאות הנפוצות של משתנים ולתקן אותן.",
  ],
  intro: `<h2>🤔 למה צריך משתנים?</h2>
<p>בתרגיל הקבלה של פרק 0 כתבת את מחיר הקרואסון פעמיים: פעם בטקסט ופעם בחישוב. אם המחיר משתנה — צריך לזכור לעדכן בשני מקומות, ומספיק לשכוח אחד כדי שהקבלה תשקר. <strong>משתנה</strong> הוא שם שנותנים לערך, כך שכותבים אותו פעם אחת ומשתמשים בו בכל מקום. בשרת אמיתי כמעט כל שורה עובדת עם משתנים: שם המשתמש שהתחבר, סכום ההזמנה, מספר הפריטים במלאי.</p>`,
  lessons: [
    { file: "lesson-01-values.html", title: "ערכים: טקסט, מספרים ואמת/שקר", minutes: 25 },
    { file: "lesson-02-variables.html", title: "משתנים: const ו־let", minutes: 35 },
    { file: "lesson-03-undefined-null.html", title: "undefined, null, ומה עם var", minutes: 20 },
  ],
  glossary: [
    ["Value", "וַולְיוּ", "ערך — פיסת מידע אחת: `5`, `\"שלום\"`, `true`"],
    ["Type", "טַייפּ", "סוג הערך: מחרוזת, מספר, בוליאני..."],
    ["String", "סְטְרִינְג", "מחרוזת — טקסט בתוך מירכאות"],
    ["Number", "נַאמְבֶּר", "מספר — שלם או עשרוני, סוג אחד לכולם"],
    ["Boolean", "בּוּלִיאַן", "ערך אמת: `true` (אמת) או `false` (שקר)"],
    ["typeof", "טַייפּ־אוֹף", "אופרטור שמחזיר את שם הסוג של ערך"],
    ["Comment", "קוֹמֶנְט", "הערה — טקסט בקוד ש־Node מדלג עליו: `//`"],
    ["Variable", "וֶרִיאַבֶּל", "משתנה — שם שמצביע על ערך"],
    ["Declaration", "דֶקְלַרֵיישֶן", "הכרזה — יצירת המשתנה (`let x`)"],
    ["Assignment", "אַסַיינְמֶנְט", "השמה — הצבת ערך במשתנה עם `=`"],
    ["const", "קוֹנְסְט", "משתנה שאי אפשר להציב בו ערך חדש"],
    ["let", "לֶט", "משתנה שאפשר להציב בו ערך חדש"],
    ["camelCase", "קֶמֶל קֵייס", "מוסכמת שמות: מילה ראשונה קטנה, כל מילה אחריה באות גדולה: `totalPrice`"],
    ["undefined", "אַנְדִיפַיינְד", "\"עוד לא קיבל ערך\""],
    ["null", "נַאל", "\"ריק בכוונה\""],
    ["TypeError", "טַייפּ אֶרוֹר", "שגיאה בזמן ריצה: פעולה לא מתאימה לסוג/למשתנה (למשל שינוי `const`)"],
  ],
  passTest: `<p>אתה מוכן לפרק 2 אם — <strong>בלי להסתכל בשיעורים</strong> — אתה יכול:</p>
<ul class="check">
<li>לכתוב תוכנית שמגדירה 3 משתנים מסוגים שונים ומדפיסה את הערך והסוג של כל אחד.</li>
<li>להסביר מתי בוחרים <code>const</code> ומתי <code>let</code> — ולתת דוגמה לכל אחד.</li>
<li>למלא טבלת מעקב לקוד של 6 שורות עם השמות חוזרות.</li>
<li>לתקן <code>TypeError: Assignment to constant variable.</code> ו־<code>ReferenceError: Cannot access ... before initialization</code>.</li>
<li>להשיג 80% ומעלה בתרגילים P01-E01 עד P01-E19, ולפתור לפחות תרגיל תיקון אחד (P01-E20 עד P01-E23).</li>
</ul>
<p>משהו לא יושב? חזור לשיעור הרלוונטי, או בקש ממני תרגילים נוספים בנקודה הזו.</p>`,
};
