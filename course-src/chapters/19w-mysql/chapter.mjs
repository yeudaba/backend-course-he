import { copyStep } from "../../lib.mjs";

export default {
  num: 19.5,
  code: "19.5",
  label: "יחידה 19.5",
  title: "MySQL: מה שונה מ־PostgreSQL",
  part: "חטיבה ג׳ — שרת, מסד נתונים ו־HTML בסיסי",
  checker: true,
  database: true, // E25 מעתיק מ־PostgreSQL ל־MySQL
  testTimeout: 120000,
  time: "3 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> PostgreSQL מפרק 16 (לתרגיל E25), ו־<strong>Docker Desktop</strong> — את Docker נלמד לעומק בפרק 23; כאן רק מריצים בו את MySQL בפקודה אחת. אם עוד לא מותקן: הורדה מ־<a href="https://www.docker.com/products/docker-desktop/" target="_blank">docker.com</a>, התקנה רגילה, ופתיחה פעם אחת.</p>
<p><strong>מה מתקינים / מריצים עכשיו:</strong></p>
<ul>
<li>MySQL 8.4 בקונטיינר (פעם אחת; אחר כך <code>docker start mysql</code>):
<pre class="mono">docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=course -e MYSQL_DATABASE=course mysql:8.4</pre></li>
<li>בדיקה: <code>docker exec -it mysql mysql -uroot -pcourse course -e "SELECT VERSION()"</code> ← <code>8.4.x</code>.</li>
<li>ב־<code>~/dev/backend-course/.env</code>: <code>COURSE_MYSQL_URL=mysql://root:course@localhost:3306</code>. הבודקים יוצרים database זמני לכל בדיקה ומוחקים אותו בסוף.</li>
<li><code>npm install</code> בתיקיית הקורס — מוסיף את <code>mysql2</code>, ה־driver של MySQL ל־Node.js.</li>
<li>תוסף VS Code (לא חובה): <a href="https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-mysql-client2" target="_blank">Database Client</a> — לראות טבלאות ולהריץ שאילתות מתוך העורך.</li>
</ul>
${copyStep("19w-mysql")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P19.5-E06</code> ← הבודק מתחבר ל־MySQL ונכשל על הקובץ הריק. <code>ECONNREFUSED 127.0.0.1:3306</code> — הקונטיינר לא רץ.</p>`,
  goals: [
    "להכיר את ההבדלים שמפתיעים מי שמגיע מ־PostgreSQL: טיפוסים, קולציות, utf8mb4, ||, RETURNING, upsert.",
    "לכתוב SQL של MySQL 8: window functions, JSON, FULLTEXT, ו־GROUP BY תחת ONLY_FULL_GROUP_BY.",
    "טרנזקציות ב־InnoDB: REPEATABLE READ, קריאות נועלות, SKIP LOCKED, ו־deadlocks — ולראות אותם קורים.",
    "Node.js מול MySQL עם mysql2: pool, execute עם ?, insertId, affectedRows, וטיפוסים שחוזרים כמחרוזות.",
    "אינדקסים ו־EXPLAIN ב־InnoDB, migrations עם GET_LOCK — והעברת נתונים מ־PostgreSQL.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרקים 16–19 עבדת עם PostgreSQL. רוב המודעות לג׳וניור Backend מבקשות "SQL" — וחלק גדול מהן מבקשות במפורש <strong>MySQL</strong>: הוא מסד הנתונים הפתוח הנפוץ בעולם, ובחברות רבות בארץ הוא הבסיס של המערכת. החדשות הטובות: 90% ממה שלמדת עובר כמו שהוא — SELECT, JOIN, GROUP BY, אינדקסים, טרנזקציות. היחידה הזו היא על ה־10% הנותרים: הדברים ש"עבדו ב־PostgreSQL" ומחזירים ב־MySQL תוצאה אחרת בשקט, והדברים שמראיין שואל עליהם כשכתוב במודעה "2+ years with MySQL".</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "MySQL מול PostgreSQL: טיפוסים, קולציות ומלכודות", minutes: 45 },
    { file: "lesson-02-queries.html", title: "שאילתות: upsert, JSON, GROUP BY ו־FULLTEXT", minutes: 40 },
    { file: "lesson-03-transactions.html", title: "InnoDB: טרנזקציות, נעילות ו־deadlocks", minutes: 50 },
    { file: "lesson-04-node.html", title: "Node.js מול MySQL עם mysql2", minutes: 45 },
    { file: "lesson-05-indexes.html", title: "אינדקסים, EXPLAIN, migrations והעברת נתונים", minutes: 50 },
  ],
  glossary: [
    ["MySQL", "מַיי־אֶס־קְיוּ־אֶל", "מסד נתונים רלציוני פתוח, הנפוץ בעולם; היום של Oracle (ו־MariaDB — fork שלו)"],
    ["InnoDB", "אִינוֹ־דִי־בִּי", "מנוע האחסון של MySQL: טרנזקציות, נעילות שורה, מפתחות זרים"],
    ["AUTO_INCREMENT", "אוֹטוֹ־אִינְקְרֶמֶנְט", "מספור אוטומטי של מפתח ראשי (ב־PostgreSQL: IDENTITY)"],
    ["Collation", "קוֹלֵיישֶׁן", "כללי השוואה ומיון של טקסט — רגיש לרישיות? לניקוד? לרווחים?"],
    ["utf8mb4", "יוּ־טִי־אֶף־8־אֶם־בִּי־4", "UTF-8 מלא (עד 4 בתים לתו, כולל אמוג׳י). utf8 של MySQL הוא רק עד 3"],
    ["sql_mode", "אֶס־קְיוּ־אֶל מוֹד", "הגדרות שקובעות כמה MySQL מחמיר: STRICT, ONLY_FULL_GROUP_BY…"],
    ["REPEATABLE READ", "רִיפִּיטַבְּל רִיד", "רמת הבידוד ברירת המחדל ב־InnoDB: קריאה רגילה רואה תמונה קבועה מתחילת הטרנזקציה"],
    ["Locking read", "לוֹקִינְג רִיד", "SELECT … FOR UPDATE / FOR SHARE — קורא את הגרסה האחרונה ונועל"],
    ["SKIP LOCKED", "סְקִיפּ לוֹקְד", "מדלג על שורות נעולות במקום לחכות — לתורי עבודות"],
    ["Deadlock", "דֶדְלוֹק", "שתי טרנזקציות שכל אחת מחכה לנעילה של השנייה; InnoDB מבטל אחת (errno 1213)"],
    ["Clustered index", "קְלַאסְטֶרְד אִינְדֶקְס", "ב־InnoDB הטבלה עצמה ממוינת לפי המפתח הראשי"],
    ["ON DUPLICATE KEY UPDATE", "אוֹן דוּפְּלִיקֵייט קִי אַפְּדֵייט", "ה־upsert של MySQL"],
    ["affectedRows / changedRows", "אֲפֶקְטֶד רוֹאוּז", "כמה שורות התאימו ל־WHERE / כמה באמת השתנו"],
    ["Implicit commit", "אִימְפְּלִיסִיט קוֹמִיט", "DDL (CREATE/ALTER) מסיים את הטרנזקציה הפתוחה — אין rollback ל־migration"],
  ],
  passTest: `<ul class="check">
<li>לתרגם שאילתה מ־PostgreSQL ל־MySQL, ולזהות את <code>||</code>, <code>ILIKE</code>, <code>DISTINCT ON</code> ו־<code>RETURNING</code>.</li>
<li>להסביר utf8 מול utf8mb4, וקולציה <code>_ai_ci</code> — ומה זה עושה ל־UNIQUE.</li>
<li>להסביר REPEATABLE READ ולמה SELECT רגיל בתוך טרנזקציה יכול להחזיר ערך ישן.</li>
<li>לכתוב טרנזקציה עם mysql2 (חיבור אחד מה־pool), ותור עבודות עם SKIP LOCKED.</li>
<li>לקרוא EXPLAIN ולבנות אינדקס מורכב בסדר הנכון.</li>
<li><code>npm run check P19.5</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
