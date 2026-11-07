import { copyStep } from "../../lib.mjs";

export default {
  num: 20,
  code: "20",
  title: "NestJS",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/tasks-api"],
  nestProjects: ["solutions/tasks-api"],
  time: "5 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+, VS Code, פרויקט 2 בשלב ב׳ (Prisma).</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li>חבילות NestJS לתרגילים — כבר רשומות ב־<code>package.json</code> של תיקיית הקורס: <code>npm install</code>.</li>
<li><a href="https://docs.nestjs.com/cli/overview" target="_blank">Nest CLI</a> — לא מתקינים גלובלית; מריצים עם <code>npx @nestjs/cli@12</code> כשיוצרים פרויקט (שיעור 1 ו־4). <strong>דורש Node 24</strong> — ב־Node ישן יותר ה־CLI נכשל עם <code>ERR_REQUIRE_CYCLE_MODULE</code>.</li>
</ul>
${copyStep("20-nestjs")}
<p><strong>איך עובדים בתרגילים:</strong> Nest משתמש ב־decorators (<code>@Controller()</code>, <code>@Get()</code>...), ו־Node לא יודע להריץ אותם ישירות מקובץ <code>.ts</code> כמו בפרקים הקודמים. לכן הבודק מקמפל כל קובץ תרגיל עם <code>tsc</code> לתיקייה <code>20-nestjs/.build</code> ומריץ משם — אתה רק כותב ומריץ <code>npm run check P20-E06</code>. (בפרויקט — <code>npm run start:dev</code> של Nest עושה את הקומפילציה.)</p>
<p><strong>✔ בדיקה:</strong> <code>npm run check P20-E06</code> צריך להיכשל על הקוד שלך — לא על "Cannot find module '@nestjs/common'".</p>`,
  goals: [
    "להבין את הארכיטקטורה של Nest: modules, controllers, providers ו־dependency injection.",
    "לכתוב controllers עם DTOs, ולידציה (class-validator) ו־pipes.",
    "להשתמש ב־custom providers ו־injection tokens — ולהחליף תלויות בבדיקות.",
    "guards, interceptors ו־exception filters: היכן כל אחד רץ, ולמה.",
    "תיעוד API אוטומטי עם Swagger, ומעבר של פרויקט 2 ל־Nest.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>ב־Express בנית בעצמך את המבנה: שכבות, הזרקת תלויות ידנית ב־<code>createApp</code>, middleware לבדיקת קלט, error handler. בפרויקט עם 5 מפתחים ו־30 מודולים, כל אחד יבנה את זה אחרת. <strong>NestJS</strong> נותן מבנה קבוע: איפה כל דבר גר, איך תלויות מוזרקות, איך בודקים קלט ואיך מטפלים בשגיאות. הוא הפך לסטנדרט בהרבה חברות שעובדות עם Node ו־TypeScript, והוא מופיע בחלק גדול ממשרות ה־Backend. החדשות הטובות: כל מה שלמדת ב־Express — עדיין שם, מתחת.</p>`,
  lessons: [
    { file: "lesson-01-architecture.html", title: "Modules, controllers ו־providers", minutes: 40 },
    { file: "lesson-02-controllers.html", title: "Controllers, DTOs ו־validation", minutes: 45 },
    { file: "lesson-03-di.html", title: "Dependency injection, guards ו־filters", minutes: 50 },
    { file: "lesson-04-project.html", title: "Swagger, בדיקות ופרויקט 2 ב־Nest", minutes: 60, note: "🤖 PR2-NEST" },
  ],
  glossary: [
    ["NestJS", "נֶסְט", "Framework לשרתי Node ב־TypeScript, עם מבנה קבוע ו־DI"],
    ["Decorator", "דֶקוֹרֵייטוֹר", "@Something() מעל class/מתודה/פרמטר — מוסיף מידע ש־Nest קורא"],
    ["Module", "מוֹדְיוּל", "יחידה שמקבצת controllers ו־providers של תחום אחד"],
    ["Controller", "קוֹנְטְרוֹלֶר", "מחלקה עם routes — שכבת ה־HTTP"],
    ["Provider", "פְּרוֹבַיידֶר", "כל דבר ש־Nest יכול להזריק: service, repository, ערך, factory"],
    ["Dependency Injection", "דִיפֶּנְדֶנְסִי אִינְג'קְשֶׁן", "Nest יוצר את התלויות ומעביר אותן ב־constructor"],
    ["Injection token", "טוֹקֶן", "מזהה לתלות שאינה class: @Inject(\"CLOCK\")"],
    ["DTO", "דִי־טִי־אוֹ", "Data Transfer Object — מחלקה שמתארת את הקלט, עם decorators של ולידציה"],
    ["Pipe", "פַּייפּ", "ממיר/בודק קלט לפני ה־handler (ParseIntPipe, ValidationPipe)"],
    ["Guard", "גַארְד", "מחליט אם הבקשה מורשית להמשיך (401/403)"],
    ["Interceptor", "אִינְטֶרְסֶפְּטוֹר", "עוטף את ה־handler: לפני ואחרי (זמנים, לוגים, שינוי תשובה)"],
    ["Exception filter", "פִילְטֶר", "תופס שגיאות וקובע את התשובה"],
    ["Swagger / OpenAPI", "סְוָוגֶר", "תיעוד API אוטומטי, עם ממשק לניסוי בדפדפן"],
  ],
  passTest: `<ul class="check">
<li>להסביר מה Nest עושה כשהוא רואה <code>constructor(private readonly tasks: TasksService)</code>, ולמה צריך <code>@Injectable()</code>.</li>
<li>לכתוב resource מלא (controller, service, DTOs, module) עם ולידציה ו־status נכונים.</li>
<li>להחליף provider בבדיקה (repository או שעון) עם <code>overrideProvider</code>.</li>
<li>לכתוב guard ו־exception filter, ולהסביר את סדר הריצה: middleware ← guards ← interceptors ← pipes ← handler ← filters.</li>
<li>פרויקט 2 ב־Nest, עם Swagger ב־<code>/docs</code>, ו־PR2-NEST עובר.</li>
<li><code>npm run check P20</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
