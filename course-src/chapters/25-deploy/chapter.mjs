import { copyStep } from "../../lib.mjs";

export default {
  num: 25,
  code: "25",
  title: "CI ופריסה: מהמחשב שלך לכתובת חיה",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/tasks-api"],
  nestProjects: ["solutions/tasks-api"],
  testTimeout: 120000, // PR2-CI מריץ tsc על כל הפרויקט
  time: "4 מפגשים",
  expectedExercises: 101,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24, Docker Desktop, ופרויקט 2 בשלב ז׳ — ב־repo משלו ב־GitHub (<code>tasks-api</code>), עם push שעובד.</p>
<p><strong>מה מתקינים / פותחים עכשיו:</strong></p>
<ul>
<li>תוסף VS Code: <a href="https://marketplace.visualstudio.com/items?itemName=github.vscode-github-actions" target="_blank">GitHub Actions</a> — השלמה ובדיקה של קובצי workflow בזמן הכתיבה, ורשימת ריצות בצד.</li>
<li>חשבון ב־<a href="https://neon.com" target="_blank">Neon</a> — PostgreSQL מנוהל בענן. בתוכנית החינמית המסד לא פג (נכון לנובמבר 2026; תנאים של תוכניות חינמיות משתנים — בדוק בדף התמחור).</li>
<li>חשבון ב־<a href="https://render.com" target="_blank">Render</a> — מריץ את ה־Docker image שלך. בתוכנית החינמית השרת "נרדם" אחרי 15 דקות בלי בקשות, ומתעורר תוך כדקה.</li>
</ul>
<p>שניהם — כניסה עם חשבון ה־GitHub, בלי כרטיס אשראי. את החשבונות פותחים רק בשיעור 5; עד אז הכול רץ אצלך ובתרגילים.</p>
${copyStep("25-deploy")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P25-E09</code> ← הבודק רץ ונכשל על קובץ ההתחלה הריק (עוד לא כתבת workflow). זה הסימן שהכול מותקן — כולל <code>js-yaml</code>, שהבודק של התרגילים האלה צריך.</p>`,
  goals: [
    "להבין CI ו־CD, ולכתוב workflow של GitHub Actions: triggers, jobs, steps, services, cache, matrix.",
    "לנהל הגדרות וסודות: env, GitHub Secrets ו־Variables, הרשאות, ולהיכשל מהר על הגדרה שגויה.",
    "לפרוס: migrations בטוחים, deploy, בדיקת עשן ו־rollback — ולהבין blue/green ו־expand/contract.",
    "HTTPS ו־reverse proxy: TLS termination, trust proxy, security headers, health מול readiness.",
    "פרויקט 2, שלב ח׳: CI/CD מלא — וקישור חי ל־API בתיק העבודות.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>הפרויקט שלך עובד, נבדק ועולה ב־Docker — אצלך. מראיין שפותח את ה־README רוצה לראות שני דברים: שהבדיקות רצות לבד על כל שינוי (ה־✓ הירוק ליד כל commit), ושיש כתובת חיה שאפשר ללחוץ עליה. ובעבודה, אף אחד לא מעלה קוד "ידנית מהמחשב": כל pull request עובר CI, וכל merge ל־main יוצא לאוויר בתהליך אוטומטי — עם בדיקה שהוא באמת עובד, ודרך חזרה אם לא. הפרק הזה סוגר את פרויקט 2: מ־<code>git push</code> ועד <code>https://…</code>.</p>`,
  lessons: [
    { file: "lesson-01-ci.html", title: "CI ו־GitHub Actions", minutes: 50 },
    { file: "lesson-02-secrets.html", title: "הגדרות וסודות", minutes: 40 },
    { file: "lesson-03-deploy.html", title: "פריסה: migrations, deploy, ובדיקת עשן", minutes: 50 },
    { file: "lesson-04-https.html", title: "HTTPS, proxy ובריאות בפרודקשן", minutes: 45 },
    { file: "lesson-05-project.html", title: "פרויקט 2, שלב ח׳: קישור חי", minutes: 90, note: "🤖 PR2-CI" },
  ],
  glossary: [
    ["CI (Continuous Integration)", "סִי־אַיי", "שרת שמריץ build ובדיקות על כל push ו־pull request, בסביבה נקייה"],
    ["CD (Delivery / Deployment)", "סִי־דִי", "Delivery: כל commit מוכן לעלות. Deployment: עולה לבד"],
    ["Workflow", "וֶורְקְפְלוֹ", "קובץ YAML ב־.github/workflows: מתי לרוץ, ואילו jobs"],
    ["Job / Step / Runner", "ג'וֹבּ / סְטֶפּ / רָאנֶר", "job = רצף צעדים על מכונה אחת (runner); jobs רצים במקביל אלא אם יש needs"],
    ["Action", "אַקְשֶׁן", "צעד מוכן לשימוש חוזר (actions/checkout@v5)"],
    ["Service container", "סֶרְוִויס קוֹנְטֵיינֶר", "קונטיינר שרץ ליד ה־job — למשל PostgreSQL לבדיקות"],
    ["Secret / Variable", "סִיקְרֶט / וֶרִיאַבְּל", "ערך מוצפן שלא מוצג בלוגים / הגדרה גלויה, שתיהן מחוץ לקוד"],
    ["Deploy hook", "דִיפְּלוֹי הוּק", "כתובת סודית שקריאה אליה מפעילה deploy בפלטפורמה"],
    ["Smoke test", "סְמוֹק טֶסְט", "בדיקה קצרה אחרי deploy: הגרסה הנכונה רצה ועונה"],
    ["Rollback", "רוֹלְבֶּק", "חזרה לגרסה הקודמת שעבדה"],
    ["Blue/green", "בְּלוּ/גְרִין", "שתי סביבות: מעלים את החדשה ליד הישנה, בודקים, ורק אז מעבירים תנועה"],
    ["Expand/contract", "אֶקְסְפֶּנְד/קוֹנְטְרַקְט", "שינוי סכמה בשלבים, כך ששתי הגרסאות עובדות מול המסד בזמן ה־deploy"],
    ["TLS termination", "טִי־אֶל־אֶס טֶרְמִינֵיישֶׁן", "ה־HTTPS \"נגמר\" ב־proxy, והוא מעביר HTTP לשרת"],
    ["Reverse proxy", "רִיוֶורְס פְּרוֹקְסִי", "שרת שמקבל בקשות מבחוץ ומעביר לאפליקציה (Caddy, nginx, load balancer)"],
    ["HSTS", "אֵייץ'־אֶס־טִי־אֶס", "header שאומר לדפדפן: לאתר הזה — רק HTTPS"],
    ["Cold start", "קוֹלְד סְטַארְט", "הבקשה הראשונה לשרת \"ישן\" — מחכה שהוא יעלה"],
  ],
  passTest: `<ul class="check">
<li>לכתוב workflow עם בדיקות, שירות PostgreSQL ו־deploy שתלוי בהן — ולקרוא לוג של ריצה שנכשלה.</li>
<li>להסביר איפה גר כל סוד, ולמה הסוד של הפרודקשן לא מגיע ל־job של הבדיקות.</li>
<li>להסביר expand/contract, ולמה migration חייב להתאים גם לגרסה הקודמת.</li>
<li>לכתוב בדיקת עשן שבודקת את ה־commit ואת /ready, ולהסביר rollback.</li>
<li>להסביר TLS termination ו־trust proxy — ומה קורה עם <code>trust proxy: true</code>.</li>
<li>פרויקט 2: PR2-CI ו־PR2-CI-DB עוברים, ה־CI ירוק ב־GitHub, ויש קישור חי ב־README.</li>
<li><code>npm run check P25</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
