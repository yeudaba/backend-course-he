import { copyStep } from "../../lib.mjs";

export default {
  num: 24,
  code: "24",
  title: "מוכן לפרודקשן: לוגים, זמן, Idempotency והגבלת קצב",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/tasks-api"],
  nestProjects: ["solutions/tasks-api"],
  time: "4 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24, PostgreSQL (מפרק 16), Docker Desktop (מפרק 23), ופרויקט 2 בשלב ו׳.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום. כל מה שבפרק — מובנה ב־Node: <code>node:crypto</code>, <code>node:async_hooks</code>, <code>Intl</code> ו־<code>performance</code>. (בעבודה תפגוש ספריות כמו pino ל־logging — אחרי הפרק תדע בדיוק מה הן עושות בשבילך.)</p>
<p>(רשות) <code>jq</code> — לקרוא לוגים של JSON בטרמינל: <code>brew install jq</code>. ב־macOS חדש הוא כבר מותקן — בדוק עם <code>jq --version</code>.</p>
${copyStep("24-production")}
<p><strong>✔ בדיקה:</strong> <code>node -e "console.log(new Date('2026-03-27T00:30:00Z').toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}))"</code> ← <code>2026-03-27 03:30:00</code>. (<code>sv-SE</code> — שוודית — כותבת תאריך ושעה בפורמט ISO; טריק מוכר.) (חצי שעה אחרי חצות UTC — ובישראל כבר 03:30, כי בדיוק עברנו לשעון קיץ. על זה — שיעור 2.)</p>`,
  goals: [
    "לכתוב לוגים מובנים (JSON) עם רמות, requestId ו־userId — ובלי סודות.",
    "לעקוב אחרי בקשה אחת מהלקוח, דרך השרת, ועד הלוג — עם X-Request-Id ו־AsyncLocalStorage.",
    "לעבוד נכון עם זמנים: רגע מול תאריך מקומי, אזורי זמן, שעון קיץ.",
    "Idempotency-Key: ניסיון חוזר בטוח, גם כשבקשות מגיעות במקביל.",
    "הגבלת קצב: fixed window, sliding window ו־token bucket — ו־429 נכון.",
    "כיבוי מסודר: לסיים בקשות לפני שסוגרים את המסד.",
    "פרויקט 2, שלב ז׳: כל אלה ב־tasks-api.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>הפרויקט שלך עובד, נבדק, ועולה ב־Docker. עכשיו דמיין אותו עם אלף משתמשים: לקוחה כותבת "משהו נכשל" — ואין לך דרך למצוא את הבקשה שלה. אפליקציה בטלפון ברכבת שולחת "צור משימה", הרשת נופלת, והיא שולחת שוב — שתי משימות. משתמש בישראל יוצר משימה ל"היום" ב־00:30 ומקבל "התאריך עבר". מישהו מנסה עשרת אלפים סיסמאות בדקה. ו־deploy חדש הורג בקשות באמצע.</p>
<p>אף אחד מאלה לא מופיע בבדיקות, וכולם מופיעים בשבוע הראשון בפרודקשן. הפרק הזה הוא ההבדל בין "זה עובד אצלי" ל"זה רץ אצל לקוחות" — והנושאים האלה הם בדיוק שאלות הראיון שמפרידות בין מי שבנה פרויקט למי שהריץ מערכת.</p>`,
  lessons: [
    { file: "lesson-01-logging.html", title: "לוגים מובנים ו־request ID", minutes: 50 },
    { file: "lesson-02-time.html", title: "זמן, אזורי זמן ושעון קיץ", minutes: 50 },
    { file: "lesson-03-idempotency.html", title: "Idempotency: לשלוח שוב בלי לחשוש", minutes: 50 },
    { file: "lesson-04-limits.html", title: "הגבלת קצב וכיבוי מסודר", minutes: 45 },
    { file: "lesson-05-project.html", title: "פרויקט 2, שלב ז׳: מוכן לפרודקשן", minutes: 75, note: "🤖 PR2-PROD" },
  ],
  glossary: [
    ["Structured logging", "סְטְרַקְצֶ'רְד לוֹגִינְג", "לוג שכל שורה בו היא אובייקט (JSON) עם שדות — לא משפט חופשי"],
    ["Log level", "לוֹג לֶבֶל", "debug / info / warn / error — כמה חשובה השורה, ומה נכתב בכל סביבה"],
    ["Request ID / Correlation ID", "רִיקְוֶוסְט אַיי־דִי", "מזהה ייחודי לבקשה, שמופיע ב־header ובכל שורת לוג שלה"],
    ["Redaction", "רִידַקְשֶׁן", "הסתרת ערכים רגישים (סיסמאות, טוקנים) לפני שהם נכתבים"],
    ["AsyncLocalStorage", "אֵסִינְק לוֹקָל סְטוֹרֶג'", "\"משתנה\" ששייך לבקשה הנוכחית ועובר דרך await — מ־node:async_hooks"],
    ["Instant", "אִינְסְטַנְט", "רגע אחד בזמן, זהה בכל העולם (Date, timestamptz)"],
    ["Time zone (IANA)", "טַיים זוֹן", "אזור עם חוקי שעון: Asia/Jerusalem. לא offset קבוע"],
    ["UTC offset", "אוֹפְסֶט", "ההפרש מ־UTC ברגע מסוים: +02:00 בחורף בישראל, +03:00 בקיץ"],
    ["DST", "דִי־אֶס־טִי", "Daylight Saving Time — שעון קיץ: יום של 23 שעות ויום של 25"],
    ["Idempotent", "אִידֶמְפּוֹטֶנְט", "פעולה שביצוע שלה פעם אחת או כמה פעמים משאיר אותו מצב"],
    ["Idempotency-Key", "אִידֶמְפּוֹטֶנְסִי קִי", "header עם מזהה של פעולה — השרת מבצע אותה פעם אחת, ובניסיון חוזר מחזיר את אותה תשובה"],
    ["Race condition", "רֵייס קוֹנְדִישֶׁן", "באג שתלוי בסדר שבו שתי פעולות במקביל מתבצעות"],
    ["Rate limiting", "רֵייט לִימִיטִינְג", "הגבלת מספר הבקשות של לקוח בפרק זמן; מעבר — 429"],
    ["Token bucket", "טוֹקֶן בָּאקֶט", "אלגוריתם הגבלה שמאפשר פרץ קצר ושומר על קצב ממוצע"],
    ["Graceful shutdown", "גְרֵייסְפוּל שַׁאטְדָאוּן", "כיבוי שמסיים את הבקשות שבאמצע, ורק אז סוגר משאבים"],
    ["Readiness / Liveness", "רֵדִינֶס / לַייבְנֶס", "\"מוכן לקבל תנועה\" מול \"התהליך חי\" — שתי בדיקות שונות"],
  ],
  passTest: `<ul class="check">
<li>להסביר מה כותבים ללוג, באיזו רמה, ומה אסור לכתוב בכלל.</li>
<li>למצוא בלוגים את כל מה שקרה בבקשה אחת לפי requestId.</li>
<li>להסביר למה <code>toISOString().slice(0, 10)</code> הוא לא "היום", ולמה יום הוא לא תמיד 24 שעות.</li>
<li>להסביר Idempotency-Key — ולמה "SELECT ואז INSERT" לא מונע כפילויות.</li>
<li>להשוות fixed window, sliding window ו־token bucket, ולהחזיר 429 עם Retry-After נכון.</li>
<li>לכבות שרת בלי לחתוך בקשות.</li>
<li>פרויקט 2: PR2-PROD ו־PR2-PROD-DB עוברים.</li>
<li><code>npm run check P24</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
