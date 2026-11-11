import { copyStep } from "../../lib.mjs";

export default {
  num: 29,
  code: "29",
  title: "AI ב־Backend: לשלב מודל שפה בשרת",
  part: "חטיבה ה׳ — ראיונות והרחבות",
  checker: true,
  time: "4 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24. <code>npm install</code> בתיקיית הקורס מוסיף את <code>@anthropic-ai/sdk</code> (ה־SDK הרשמי של Claude ל־TypeScript).</p>
${copyStep("29-ai-backend")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P29-E06</code> ← הבודק רץ ונכשל על קובץ ההתחלה.</p>
<p><strong>לא צריך מפתח API ולא עולה כסף.</strong> כל הבודקים משתמשים ב־SDK האמיתי עם <code>fetch</code> מדומה — שום בקשה לא יוצאת לרשת. כדי לנסות מול ה־API האמיתי (לא חובה): חשבון ב־<a href="https://platform.claude.com" target="_blank">platform.claude.com</a>, מפתח, ו־<code>ANTHROPIC_API_KEY</code> ב־<code>.env</code> של פרויקט שלך — עם מגבלת הוצאה חודשית בקונסולה, לפני הקריאה הראשונה.</p>
<p><strong>פרק חובה.</strong> יחידה 29.5 ופרויקט 4 נשענים עליו, ו־"שילבתי מודל שפה בשרת, עם בדיקות, הגבלת עלות והרשאות" הוא משפט שמראיינים שואלים עליו יותר ויותר.</p>`,
  goals: [
    "לקרוא ל־Claude מ־Node.js עם ה־SDK הרשמי, ולהבין מה חוזר: בלוקים, stop_reason, usage.",
    "לקבל פלט מובנה ומאומת (structured outputs + Zod), ולהתייחס לפלט של מודל כקלט לא אמין.",
    "tool use: לתת למודל כלים — בלולאה נכונה, ועם ההרשאות של המשתמש בלבד.",
    "פרודקשן: streaming, שגיאות ו־fallback, עלות (prompt caching, תקציב), cache לתשובות, prompt injection ופרטיות.",
    "לבדוק פיצ׳רים של AI: לקוח מדומה, evals, וזרימות שבהן הקוד מחליט והמודל עושה צעדים מוגדרים.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>הרבה מאוד פיצ׳רים חדשים בשנים האחרונות הם "שלב מודל שפה": לסכם ביקורות, לסווג פניות, לענות על שאלות מתוך מסמכי החברה, לתת למשתמש לחפש במילים שלו. בצד ה־Backend זה לא קסם — זו קריאת HTTP לשירות חיצוני: איטית, עולה כסף לפי שימוש, ומחזירה טקסט שאי אפשר לסמוך עליו בעיניים עצומות. כל מה שלמדת בקורס חל כאן: ולידציה (פרק 15), הרשאות (21), בדיקות (22), סודות (25), cache ותורים (26), retry ו־circuit breaker (28). הפרק מראה איך להפעיל אותם על הקופסה החדשה.</p>`,
  lessons: [
    { file: "lesson-01-api.html", title: "הקריאה הראשונה: בקשה, תשובה, ועלות", minutes: 45 },
    { file: "lesson-02-structured.html", title: "פלט מובנה, ופלט שאי אפשר לסמוך עליו", minutes: 40 },
    { file: "lesson-03-tools.html", title: "כלים, הרשאות ו־prompt injection", minutes: 50 },
    { file: "lesson-04-production.html", title: "פרודקשן: streaming, שגיאות, עלות ופרטיות", minutes: 50 },
    { file: "lesson-05-testing.html", title: "לבדוק AI: לקוח מדומה, evals, וזרימות", minutes: 50 },
  ],
  glossary: [
    ["LLM", "אֶל־אֶל־אֶם", "Large Language Model — מודל שפה: מקבל טקסט (ותמונות), מחזיר טקסט"],
    ["Token", "טוֹקֶן", "יחידת הטקסט שהמודל קורא וכותב; לפיה מחשבים מחיר ומגבלות"],
    ["Prompt / System prompt", "פְּרוֹמְפְּט", "הקלט למודל / ההוראות הקבועות של האפליקציה"],
    ["Context window", "קוֹנְטֶקְסְט וִינְדוֹאוּ", "כמה טוקנים נכנסים בבקשה אחת (קלט + פלט)"],
    ["stop_reason", "סְטוֹפּ רִיזְן", "למה המודל הפסיק: end_turn, max_tokens, tool_use, refusal…"],
    ["Structured outputs", "סְטְרַקְצֶ'רְד אָאוּטְפּוּטְס", "פלט שמוגבל לסכמת JSON שהגדרת"],
    ["Tool use", "טוּל יוּז", "המודל מבקש להריץ פונקציה שהגדרת; אתה מריץ ומחזיר תוצאה"],
    ["Agent / Workflow", "אֵייגֶ'נְט / וֶורְקְפְלוֹ", "מודל שמחליט על הצעדים בעצמו / קוד שמחליט, ומודל שמבצע צעדים"],
    ["Prompt injection", "פְּרוֹמְפְּט אִינְגֶ'קְשֶׁן", "טקסט זדוני בתוך תוכן שמשנה את מה שהמודל עושה"],
    ["Prompt caching", "פְּרוֹמְפְּט קֶאשִׁינְג", "ה־API זוכר את תחילת הבקשה ומוזיל אותה בפעם הבאה"],
    ["Streaming", "סְטְרִימִינְג", "קבלת התשובה בחלקים, בזמן שהיא נכתבת"],
    ["Eval", "אִיוַול", "סט מקרים עם בדיקות, שמודד איכות של פיצ׳ר AI"],
    ["RAG", "רַאג", "Retrieval-Augmented Generation: לשלוף מסמכים רלוונטיים ולשלוח אותם עם השאלה"],
    ["Hallucination", "הָלוּסִינֵיישֶׁן", "תשובה שנשמעת בטוחה ואינה נכונה"],
    ["Fallback", "פוֹלְבֶּק", "דרך חלופית כשהראשית נכשלה — מודל אחר, תשובה קבועה, או בן אדם"],
  ],
  passTest: `<ul class="check">
<li>לכתוב קריאה ל־API שבודקת stop_reason, אוספת רק טקסט, ומחשבת עלות מ־usage.</li>
<li>להסביר למה פלט של מודל הוא קלט לא אמין — ולאמת אותו עם Zod.</li>
<li>לכתוב לולאת tool use נכונה, ולהסביר למה ההרשאה בכלי ולא ב־prompt.</li>
<li>להסביר prompt injection, ושלוש שכבות הגנה (הפרדה, least privilege, הרשאות בקוד).</li>
<li>להסביר prompt caching, ולמה תאריך ב־system מבטל אותו.</li>
<li>לבדוק פיצ׳ר AI בלי רשת ובלי כסף, ולהריץ eval לפני שינוי prompt.</li>
<li><code>npm run check P29</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
