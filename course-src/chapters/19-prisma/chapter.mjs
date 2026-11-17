import { copyStep } from "../../lib.mjs";

export default {
  num: 19,
  code: "19",
  title: "Prisma ו־migrations",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  database: true,
  prismaProjects: ["files", "solutions/tasks-api"],
  time: "5 מפגשים",
  expectedExercises: 88,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> PostgreSQL, מסד <code>course</code>, <code>.env</code> (פרק 16).</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li><a href="https://www.prisma.io/docs" target="_blank">Prisma 7</a> — כבר רשום ב־<code>package.json</code> של תיקיית הקורס: <code>npm install</code>.</li>
<li>תוסף <a href="https://marketplace.visualstudio.com/items?itemName=Prisma.prisma" target="_blank">Prisma</a> ל־VS Code (מזהה <code>Prisma.prisma</code>) — צבעים, השלמה ועיצוב לקובצי <code>.prisma</code>.</li>
</ul>
${copyStep("19-prisma")}
<p><strong>מסד נפרד לפרק</strong> (כדי ש־Prisma לא יתנגש בטבלאות של פרקים 16–18):</p>
<pre class="terminal"><span class="prompt">% </span>createdb shop                    <span class="dim"># ב־EDB: createdb -U postgres shop</span></pre>
<p>והוסף ל־<code>.env</code> של תיקיית הקורס שורה:</p>
<pre class="terminal">SHOP_DATABASE_URL=postgresql://localhost:5432/shop</pre>
<p>(ב־EDB: <code>postgresql://postgres:<em>הסיסמה</em>@localhost:5432/shop</code>.) ואז, מתוך תיקיית הפרק:</p>
<pre class="terminal"><span class="prompt">% </span>cd ~/dev/backend-course/19-prisma/files
<span class="prompt">% </span>npx prisma migrate dev           <span class="dim"># יוצר את הטבלאות לפי prisma/migrations</span>
<span class="prompt">% </span>npx prisma db seed               <span class="dim"># טוען נתוני דוגמה</span>
<span class="prompt">% </span>npx prisma generate              <span class="dim"># מייצר את Prisma Client ל־generated/prisma</span></pre>
<p><strong>✔ בדיקה:</strong> <code>npx prisma studio</code> — נפתח דפדפן עם הטבלאות והנתונים. ו־<code>npm run check P19-E06</code> (מתיקיית הקורס) צריך להיכשל על הקוד שלך — לא על "לא נמצא Prisma Client".</p>`,
  goals: [
    "להבין מה ORM עושה, מה הוא חוסך ומה הוא מסתיר.",
    "לכתוב schema של Prisma: מודלים, טיפוסים, קשרים, enums ו־indexes.",
    "לנהל שינויים במבנה עם migrations — בפיתוח ובייצור.",
    "לשלוף ולשנות נתונים עם Prisma Client: סינון, include, pagination, transactions ושגיאות.",
    "להעביר את פרויקט 2 ל־PostgreSQL — בלי לגעת ב־routes וב־service.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרק 18 כתבת SQL כמחרוזות בתוך TypeScript. זה עובד, אבל TypeScript לא יודע מה חוזר מהשאילתה, שגיאת כתיב בשם עמודה מתגלה רק בזמן ריצה, ושינויי מבנה מנוהלים ביד. <strong>ORM</strong> כמו Prisma נותן טיפוסים מלאים מהסכמה, שאילתות כקוד, ו־migrations שנכנסים ל־Git. Prisma הוא ה־ORM הנפוץ ביותר ב־TypeScript, ומופיע בהרבה משרות. בסוף הפרק פרויקט 2 שומר משימות ב־PostgreSQL — ונשאר עם בדיוק אותו API.</p>`,
  lessons: [
    { file: "lesson-01-setup.html", title: "ORM, Prisma והחיבור הראשון", minutes: 40 },
    { file: "lesson-02-schema.html", title: "Schema, קשרים ו־migrations", minutes: 45 },
    { file: "lesson-03-queries.html", title: "שאילתות, transactions ושגיאות", minutes: 50 },
    { file: "lesson-04-project.html", title: "פרויקט 2 עובר ל־PostgreSQL", minutes: 60, note: "🤖 PR2-DB" },
  ],
  glossary: [
    ["ORM", "אוֹ־אַר־אֶם", "Object-Relational Mapping — עבודה עם טבלאות כאובייקטים בקוד"],
    ["Prisma schema", "פְּרִיזְמָה סְקִימָה", "קובץ .prisma שמתאר את המודלים — ממנו נוצרים הטבלאות והטיפוסים"],
    ["Model", "מוֹדֶל", "טבלה בסכמה: model Product { ... }"],
    ["Migration", "מִיגְרֵיישֶׁן", "קובץ SQL עם שינוי מבנה אחד, שנכנס ל־Git ורץ בכל סביבה"],
    ["Prisma Client", "פְּרִיזְמָה קְלַיינְט", "הקוד שנוצר מהסכמה: prisma.product.findMany(...) עם טיפוסים"],
    ["Driver adapter", "דְרַייבֶר אַדַפְּטֶר", "החיבור הממשי למסד (כאן: pg) ש־Prisma 7 משתמש בו"],
    ["include / select", "אִינְקְלוּד / סֶלֶקְט", "להביא קשרים יחד עם הרשומה / לבחור שדות"],
    ["Decimal", "דֶצִימָל", "טיפוס מדויק לכסף — חוזר כאובייקט, לא כ־number"],
    ["Seed", "סִיד", "נתונים התחלתיים לפיתוח ולבדיקות"],
    ["Prisma Studio", "פְּרִיזְמָה סְטוּדְיוֹ", "ממשק דפדפן לצפייה ועריכה של הנתונים"],
  ],
  passTest: `<ul class="check">
<li>להקים Prisma בפרויקט חדש מאפס: התקנה, config, schema, migration, generate, ושאילתה ראשונה.</li>
<li>להוסיף שדה למודל קיים עם נתונים — ולהסביר מה ה־migration עושה ולמה הוא נכנס ל־Git.</li>
<li>לכתוב שאילתה עם סינון, include, מיון ו־pagination, ולתרגם P2002/P2025 ל־409/404.</li>
<li>הזמנה עם הורדת מלאי ב־transaction, בלי מרוץ.</li>
<li>פרויקט 2 עובד מול PostgreSQL, ו־<code>npm run check PR2 -- --dir ~/dev/tasks-api</code> עובר כולל PR2-DB.</li>
<li><code>npm run check P19</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
