import { copyStep } from "../../lib.mjs";

export default {
  num: 21,
  code: "21",
  title: "כניסה והרשאות",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/tasks-api"],
  nestProjects: ["solutions/tasks-api"],
  time: "5 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+, VS Code, PostgreSQL, ופרויקט 2 בשלב ג׳ (NestJS).</p>
<p><strong>מה מתקינים עכשיו:</strong> שתי חבילות — הן כבר רשומות ב־<code>package.json</code> של תיקיית הקורס (<code>npm install</code>), ובפרויקט מתקינים אותן בשיעור 5:</p>
<ul>
<li><a href="https://www.npmjs.com/package/bcryptjs" target="_blank">bcryptjs</a> — hashing של סיסמאות. JavaScript טהור: אין קומפילציה של קוד C, אין תלות בגרסת Node.</li>
<li><a href="https://docs.nestjs.com/security/authentication" target="_blank">@nestjs/jwt</a> — יצירה ובדיקה של JWT בתוך Nest.</li>
</ul>
<p><strong>כדאי לשמור בסימניות:</strong> <a href="https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" target="_blank">OWASP — אחסון סיסמאות</a> · <a href="https://owasp.org/API-Security/editions/2023/en/0x11-t10/" target="_blank">OWASP API Security Top 10 (2023)</a>.</p>
${copyStep("21-auth")}
<p><strong>✔ בדיקה:</strong> ב־Terminal, בתיקיית הקורס: <code>node -e "import('bcryptjs').then(b =&gt; b.default.hash('x', 4)).then(console.log)"</code> ← שורה שמתחילה ב־<code>$2b$04$</code>.</p>`,
  goals: [
    "לשמור סיסמאות נכון: hash איטי עם salt (bcrypt), ומה בדיוק נשמר במסד.",
    "להבין JWT מבפנים: מה כתוב בו, מה החתימה מבטיחה, ומה היא לא מבטיחה.",
    "access token קצר + refresh token ארוך, עם rotation וזיהוי שימוש חוזר.",
    "הרשאות: תפקידים (roles) ובעלות על מידע — ולמה 404 ולא 403.",
    "OWASP בסיסי: הפרצות הנפוצות ב־API, ואיך הקוד שלך נמנע מהן.",
    "פרויקט 2, שלב ד׳: משתמשים — וכל משתמש רואה רק את המשימות שלו.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>עד עכשיו ה־API של פרויקט 2 היה פתוח: כל מי שמכיר את הכתובת רואה, משנה ומוחק הכול. כמעט לכל מוצר אמיתי יש משתמשים, וברגע שיש משתמשים — יש שתי שאלות שהשרת שואל בכל בקשה: <strong>מי אתה?</strong> (authentication) ו<strong>מה מותר לך?</strong> (authorization). זה גם הפרק שבו טעות קטנה הופכת לכותרת בעיתון: סיסמאות שנשמרו כמו שהן, או API שמחזיר את ההזמנות של לקוח אחר אם רק משנים מספר ב־URL. בראיונות שואלים על זה כמעט תמיד — ובסוף הפרק תוכל להסביר כל שורה בקוד שלך.</p>`,
  lessons: [
    { file: "lesson-01-passwords.html", title: "סיסמאות: hashing ו־bcrypt", minutes: 45 },
    { file: "lesson-02-jwt.html", title: "JWT ו־guard של התחברות", minutes: 50 },
    { file: "lesson-03-refresh.html", title: "refresh tokens ויציאה", minutes: 45 },
    { file: "lesson-04-authorization.html", title: "הרשאות, בעלות ו־OWASP", minutes: 50 },
    { file: "lesson-05-project.html", title: "פרויקט 2, שלב ד׳: משתמשים", minutes: 90, note: "🤖 PR2-AUTH" },
  ],
  glossary: [
    ["Authentication", "אוֹתֶנְטִיקֵיישֶׁן", "אימות זהות — \"מי אתה?\" (כניסה). שגיאה: 401"],
    ["Authorization", "אוֹתוֹרִיזֵיישֶׁן", "הרשאה — \"מה מותר לך?\". שגיאה: 403 (או 404)"],
    ["Hash", "הָאשׁ", "פונקציה חד־כיוונית: מהסיסמה מקבלים מחרוזת, ומהמחרוזת אי אפשר לחזור לסיסמה"],
    ["Salt", "סוֹלְט", "ערך אקראי שמתווסף לסיסמה לפני ה־hash — שתי סיסמאות זהות נותנות hash שונה"],
    ["bcrypt", "בִּי־קְרִיפְּט", "אלגוריתם hash איטי בכוונה, לסיסמאות. כולל salt ו־cost"],
    ["Cost / rounds", "קוֹסְט", "כמה איטי ה־hash: כל +1 מכפיל את הזמן"],
    ["JWT", "ג'וֹט / ג'יי־דַבְּלְיוּ־טִי", "JSON Web Token: header.payload.signature — מידע חתום שהשרת יכול לבדוק בלי מסד"],
    ["Bearer token", "בֵּירֶר", "טוקן שמי שמחזיק בו — נכנס. נשלח ב־Authorization: Bearer ..."],
    ["Access token", "אַקְסֶס טוֹקֶן", "טוקן קצר־מועד (דקות) שנשלח בכל בקשה"],
    ["Refresh token", "רִיפְרֶשׁ טוֹקֶן", "טוקן ארוך־מועד (ימים), רק לקבלת access token חדש"],
    ["Rotation", "רוֹטֵיישֶׁן", "כל refresh token עובד פעם אחת ומוחלף בחדש"],
    ["Role", "רוֹל", "תפקיד (user, admin) שקובע מה מותר"],
    ["IDOR / BOLA", "אַיְי־דוֹר / בּוֹלָה", "גישה לאובייקט של משתמש אחר רק משינוי id. הפרצה מספר 1 ב־API"],
    ["Mass assignment", "מַאס אַסַיְינְמֶנְט", "שדה שהלקוח לא אמור לקבוע (role, ownerId) נכנס דרך גוף הבקשה"],
    ["User enumeration", "אִינוּמֶרֵיישֶׁן", "לגלות אילו אימיילים רשומים לפי הבדל בתשובה או בזמן"],
    ["OWASP", "אוֹ־וַואסְפּ", "ארגון שמפרסם את רשימות הפרצות הנפוצות והמלצות הגנה"],
  ],
  passTest: `<ul class="check">
<li>להסביר למה <code>sha256(password)</code> לא מספיק, ומה bcrypt מוסיף (salt, cost).</li>
<li>לפרק JWT ביד, ולהסביר למה שינוי <code>role</code> ב־payload לא עובד — ומה כן אפשר לקרוא ממנו בלי הסוד.</li>
<li>לכתוב guard גלובלי עם <code>@Public()</code>, ו־<code>@Roles()</code> עם <code>Reflector</code>.</li>
<li>להסביר access + refresh, rotation, ומה קורה כשמישהו משתמש ב־refresh token ישן.</li>
<li>להסביר 401 / 403 / 404, ולמה משימה של משתמש אחר מחזירה 404.</li>
<li>פרויקט 2: PR2-AUTH ו־PR2-AUTH-DB עוברים.</li>
<li><code>npm run check P21</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
