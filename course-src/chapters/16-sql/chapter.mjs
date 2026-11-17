import { copyStep } from "../../lib.mjs";

export default {
  num: 16,
  code: "16",
  title: "SQL מהיסוד",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  database: true,
  time: "5 מפגשים",
  expectedExercises: 80,
  install: `<p><strong>מה מתקינים עכשיו:</strong> שרת PostgreSQL, תוסף ל־VS Code, ומסד לקורס.</p>
<h3>1. שרת PostgreSQL</h3>
<p><strong>קודם בדוק אם כבר יש לך:</strong> ב־Terminal, <code>ls /Library/PostgreSQL /Applications | grep -i postgres</code>. אם מופיע <code>PostgreSQL 18</code> (או גרסה אחרת) — כבר הותקן בעבר (מהאתר של EDB, עם pgAdmin). <strong>אל תתקין Postgres.app בנוסף</strong> — שניהם ירצו את פורט 5432. דלג לסעיף "יש לי כבר PostgreSQL".</p>
<p><strong>אין לך:</strong> הורד את <a href="https://postgresapp.com/downloads.html" target="_blank">Postgres.app</a> (הגרסה האחרונה), גרור ל־Applications, פתח ← <strong>Initialize</strong>. בפינה יופיע פיל 🐘. ואז הוסף את כלי שורת הפקודה (פעם אחת):</p>
<pre class="terminal"><span class="prompt">% </span>sudo mkdir -p /etc/paths.d &amp;&amp; echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp</pre>
<p>סגור ופתח מחדש את ה־Terminal. ב־Postgres.app המשתמש הוא שם המשתמש שלך ב־Mac, בלי סיסמה.</p>
<p><strong>יש לי כבר PostgreSQL (EDB):</strong> המשתמש הוא <code>postgres</code>, והסיסמה — זו שבחרת בהתקנה. כלי שורת הפקודה נמצאים ב־<code>/Library/PostgreSQL/18/bin</code>; הוסף אותם ל־PATH: <code>echo 'export PATH="/Library/PostgreSQL/18/bin:$PATH"' &gt;&gt; ~/.zshrc</code>, ופתח Terminal חדש.</p>
<h3>2. מסד לקורס ונתוני הדוגמה</h3>
<pre class="terminal"><span class="prompt">% </span>createdb course                 <span class="dim"># ב־EDB: createdb -U postgres course</span>
<span class="prompt">% </span>cd ~/dev/backend-course
<span class="prompt">% </span>psql -d course -f 16-sql/files/shop.sql      <span class="dim"># ב־EDB: psql -U postgres -d course -f ...</span></pre>
<p>(בטעינה הראשונה יופיעו שתי שורות <code>NOTICE: table ... does not exist, skipping</code> — זה תקין.)</p>
<h3>3. חיבור לבודק</h3>
<p>צור בתיקיית הקורס קובץ <code>.env</code> עם שורה אחת:</p>
<pre class="terminal">COURSE_DATABASE_URL=postgresql://localhost:5432/course</pre>
<p>ב־EDB: <code>COURSE_DATABASE_URL=postgresql://postgres:<em>הסיסמה</em>@localhost:5432/course</code>. ואז <code>npm install</code> (מתקין את <code>pg</code>, הספרייה שהבודק משתמש בה).</p>
<h3>4. תוסף ל־VS Code</h3>
<p><a href="https://marketplace.visualstudio.com/items?itemName=ms-ossdata.vscode-pgsql" target="_blank">PostgreSQL</a> של Microsoft (מזהה <code>ms-ossdata.vscode-pgsql</code>). אחרי ההתקנה: אייקון הפיל בסרגל הצד ← <strong>Add Connection</strong> ← Server <code>localhost</code>, Database <code>course</code>, המשתמש (והסיסמה ב־EDB). מעכשיו: פותחים קובץ <code>.sql</code>, מסמנים שאילתה ← <kbd>⌘</kbd>+<kbd>⇧</kbd>+<kbd>E</kbd> — והתוצאה מופיעה בטבלה.</p>
${copyStep("16-sql")}
<p><strong>✔ בדיקה:</strong> <code>psql -d course -c "select count(*) from products"</code> ← <code>14</code>. ו־<code>npm run check P16-E06</code> צריך להיכשל עם "הקובץ ריק" — לא עם "אין חיבור למסד".</p>`,
  goals: [
    "להבין מה זה מסד נתונים יחסי, ולמה לא סתם קובץ JSON.",
    "לשלוף נתונים: SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, ביטויים וכינויים.",
    "להבין NULL — ולא ליפול בו.",
    "פונקציות צבירה בסיסיות: COUNT, SUM, AVG, MIN, MAX.",
    "ליצור טבלה עם טיפוסים ואילוצים, ולשנות נתונים: INSERT, UPDATE, DELETE — בזהירות.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>ב־API של פרויקט 2 המשימות נעלמות בכל הפעלה מחדש. בשרת אמיתי הנתונים חיים ב<strong>מסד נתונים</strong> — ו־SQL היא השפה שבה מדברים איתו. גם כשנשתמש ב־Prisma (פרק 19), מתחת יש SQL, ובראיונות ל־Backend כמעט תמיד יש שאלת SQL ("כתוב שאילתה שמחזירה..."). זה גם ידע שלא מתיישן: SQL קיים 50 שנה, ועובד כמעט אותו דבר ב־PostgreSQL, MySQL ו־SQL Server.</p>`,
  lessons: [
    { file: "lesson-01-intro.html", title: "מסד נתונים, טבלאות ו־psql", minutes: 30 },
    { file: "lesson-02-select.html", title: "SELECT: לשלוף, לסנן, למיין", minutes: 45 },
    { file: "lesson-03-null-aggregates.html", title: "NULL וצבירות", minutes: 35 },
    { file: "lesson-04-ddl-dml.html", title: "יצירת טבלאות ושינוי נתונים", minutes: 45 },
  ],
  glossary: [
    ["Database", "דָאטָה־בֵּייס", "מסד נתונים — תוכנה ששומרת נתונים בצורה בטוחה ומאפשרת לשאול עליהם"],
    ["RDBMS", "אַר־דִי־בִּי־אֶם־אֶס", "מסד נתונים יחסי — נתונים בטבלאות עם קשרים (PostgreSQL, MySQL)"],
    ["SQL", "אֶס־קְיוּ־אֶל / סִיקְוֶול", "Structured Query Language — שפת השאילתות"],
    ["Table / Row / Column", "טֵייבְּל / רוֹאוּ / קוֹלוּם", "טבלה / שורה (רשומה) / עמודה (שדה)"],
    ["Query", "קְוֶורִי", "שאילתה — פקודה למסד"],
    ["Primary key", "פְּרַיימֶרִי קִי", "מפתח ראשי — מזהה ייחודי לכל שורה"],
    ["Constraint", "קוֹנְסְטְרֵיינְט", "אילוץ — חוק שהמסד אוכף: NOT NULL, UNIQUE, CHECK"],
    ["NULL", "נָאל", "\"אין ערך / לא ידוע\" — לא 0 ולא מחרוזת ריקה"],
    ["Aggregate", "אַגְרֶגֵייט", "פונקציה שמסכמת הרבה שורות לערך אחד: COUNT, SUM"],
    ["DDL / DML", "דִי־דִי־אֶל / דִי־אֶם־אֶל", "פקודות מבנה (CREATE, ALTER) / פקודות נתונים (INSERT, UPDATE)"],
    ["psql", "פִּי־אֶס־קְיוּ־אֶל", "ממשק שורת הפקודה של PostgreSQL"],
  ],
  passTest: `<ul class="check">
<li>לכתוב שאילתה עם סינון על כמה תנאים, מיון בשני שדות ו־LIMIT — בלי לבדוק בתיעוד.</li>
<li>להסביר למה <code>WHERE phone = NULL</code> לא מחזיר כלום, ומה כותבים במקום.</li>
<li>ליצור טבלה עם מפתח ראשי, NOT NULL, DEFAULT, UNIQUE ו־CHECK — ולהראות שכל אילוץ עובד.</li>
<li>לעדכן ולמחוק שורות עם WHERE מדויק, ולבדוק עם SELECT לפני.</li>
<li><code>npm run check P16</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
