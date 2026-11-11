import { copyStep } from "../../lib.mjs";

export default {
  num: 22,
  code: "22",
  title: "בדיקות",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/tasks-api"],
  nestProjects: ["solutions/tasks-api"],
  testTimeout: 300000, // PR2-TESTS מריץ את Jest כמה פעמים (גם עם באגים מכוונים)
  time: "5 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> <strong>Node.js 24</strong> (בדוק: <code>node -v</code>), VS Code, PostgreSQL, ופרויקט 2 בשלב ד׳.</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li>לתרגילים — כלום: <a href="https://nodejs.org/api/test.html" target="_blank">node:test</a> מובנה ב־Node.</li>
<li>לפרויקט (שיעור 5) — <a href="https://jestjs.io/docs/getting-started" target="_blank">Jest</a>, <a href="https://kulshekhar.github.io/ts-jest/" target="_blank">ts-jest</a> ו־<a href="https://github.com/ladjs/supertest" target="_blank">supertest</a> — אותם כלים שתבנית NestJS מתקינה. הם גם ב־<code>package.json</code> של תיקיית הקורס (<code>npm install</code>), כי הבודק של הפרויקט מריץ אותם.</li>
<li>תוסף VS Code (רשות): <a href="https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest" target="_blank">Jest</a> — מריץ בדיקות מתוך העורך.</li>
</ul>
${copyStep("22-testing")}
<p><strong>✔ בדיקה:</strong> בתיקיית הקורס, <code>node --test 22-testing/starter/P22-E06.spec.ts</code> ← שורה שמסתיימת ב־<code># TODO</code>, ובסיכום <code>ℹ todo 1</code> — יש בדיקה "לכתוב", ועוד אין בדיקות שנכשלות.</p>`,
  goals: [
    "לדעת מה לבדוק ובאיזו רמה: unit, integration, e2e — והפירמידה.",
    "לכתוב בדיקות עם node:test ו־assert, כולל גבולות, שגיאות ו־async.",
    "להשתמש בכפילים (stub, fake, spy) ובשעון מזויף — ולדעת מתי לא.",
    "בדיקות HTTP ובדיקות מול מסד בדיקות אמיתי.",
    "Jest ו־supertest ב־Nest, כיסוי (coverage), ו־mutation testing.",
    "פרויקט 2, שלב ה׳: חבילת בדיקות שתופסת באגים אמיתיים.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>עד עכשיו הבודק של הקורס בדק את הקוד שלך. מהפרק הזה — <strong>אתה</strong> כותב את הבדיקות. בעבודה זה לא תוספת: כמעט כל pull request צריך בדיקות, וב־code review שואלים "איפה הבדיקה לזה?". בדיקות הן גם מה שמאפשר לשנות קוד בלי פחד — מעבר ל־Prisma או ל־Nest (כמו שעשית בפרויקט 2) הוא בטוח רק כשיש משהו שאומר "עדיין עובד". והפרק הזה גם מלמד לזהות בדיקה <em>גרועה</em>: כזו שירוקה תמיד, גם כשהקוד שבור. הבודק כאן לא רק מריץ את הבדיקות שלך — הוא מכניס באגים לקוד ובודק שהבדיקות שלך תופסות אותם.</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "למה, מה, ו־node:test", minutes: 45 },
    { file: "lesson-02-doubles.html", title: "כפילים, זמן וקוד בדיק", minutes: 50 },
    { file: "lesson-03-integration.html", title: "בדיקות HTTP ומסד בדיקות", minutes: 45 },
    { file: "lesson-04-jest.html", title: "Jest, Nest, כיסוי ו־mutation testing", minutes: 45 },
    { file: "lesson-05-project.html", title: "פרויקט 2, שלב ה׳: בדיקות", minutes: 90, note: "🤖 PR2-TESTS" },
  ],
  glossary: [
    ["Unit test", "יוּנִיט טֶסְט", "בדיקה של יחידה אחת (פונקציה, מחלקה) לבד, בלי מסד ורשת"],
    ["Integration test", "אִינְטֶגְרֵיישֶׁן", "בדיקה של הקוד שלך מול מערכת אמיתית (מסד, HTTP)"],
    ["E2E test", "אִי־טוּ־אִי", "End-to-end: כל השרשרת, כמו שמשתמש או לקוח משתמשים בה"],
    ["Test pyramid", "פִּירָמִידָה", "הרבה בדיקות unit מהירות, פחות integration, מעט e2e"],
    ["AAA", "אֵיי־אֵיי־אֵיי", "Arrange, Act, Assert — הכנה, פעולה, בדיקה"],
    ["Assertion", "אַסֶרְשֶׁן", "טענה שהבדיקה בודקת: assert.equal(actual, expected)"],
    ["Test double", "טֶסְט דַאבֶּל", "\"כפיל\" — משהו שמחליף תלות אמיתית בבדיקה"],
    ["Stub", "סְטַאבּ", "כפיל שמחזיר תשובה קבועה"],
    ["Fake", "פֵייק", "מימוש אמיתי ופשוט (למשל repository בזיכרון)"],
    ["Spy / Mock", "סְפַּיי / מוֹק", "כפיל שמקליט קריאות (mock.fn / jest.fn), ובודקים מה נקרא"],
    ["Fixture / Builder", "פִיקְסְצֶ'ר / בִּילְדֶר", "נתוני בדיקה מוכנים, או פונקציה שיוצרת אותם"],
    ["Flaky test", "פְלֵייקִי", "בדיקה שלפעמים עוברת ולפעמים לא, בלי שהקוד השתנה"],
    ["Coverage", "קַאבְרֶג'", "אילו שורות/ענפים רצו בזמן הבדיקות"],
    ["Mutation testing", "מְיוּטֵיישֶׁן", "מכניסים באגים קטנים לקוד ובודקים שהבדיקות נכשלות"],
    ["Regression", "רֶגְרֶשֶׁן", "באג שחוזר אחרי שתוקן — לכן כותבים בדיקה עם התיקון"],
  ],
  passTest: `<ul class="check">
<li>להסביר unit / integration / e2e, ולבחור מה לבדוק קודם.</li>
<li>לכתוב בדיקה שנכשלת כשיש באג: גבולות, שגיאות, async (עם <code>await</code>).</li>
<li>להחליף שעון, מייל או repository בכפיל — ולהסביר מתי fake עדיף על mock.</li>
<li>לכתוב בדיקת HTTP מול שרת על פורט פנוי, ובדיקה מול מסד בדיקות.</li>
<li>להסביר למה 100% coverage לא אומר שאין באגים.</li>
<li>פרויקט 2: PR2-TESTS עובר — כולל ש־7 הבאגים המכוונים נתפסים.</li>
<li><code>npm run check P22</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
