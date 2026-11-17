import { copyStep } from "../../lib.mjs";

export default {
  num: 26,
  code: "26",
  title: "Redis: מטמון, מצב משותף ותורים",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true,
  prismaProjects: ["solutions/coffee-shop"],
  nestProjects: ["solutions/coffee-shop"],
  testTimeout: 180000, // PR3-REDIS מעלה את השרת ומחכה לביטול אוטומטי
  time: "4 מפגשים",
  expectedExercises: 120, // 25 + חמישה של שיעור 6 (זמן אמת) + שלושה של תרגול כתיבה
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24, Docker Desktop, ופרויקט 3 (חנות הקפה) בשלב 4 — כל בודקי PR3 עוברים.</p>
<p><strong>מה מתקינים / מריצים עכשיו:</strong></p>
<ul>
<li>Redis 8 בקונטיינר (פעם אחת; אחר כך <code>docker start redis</code>):
<pre class="mono">docker run -d --name redis -p 6379:6379 redis:8-alpine</pre></li>
<li>בדיקה: <code>docker exec -it redis redis-cli ping</code> ← <code>PONG</code>.</li>
<li>ב־<code>~/dev/backend-course/.env</code> — שורה <code>COURSE_REDIS_URL=redis://localhost:6379</code> (הבודקים משתמשים בה; זו גם ברירת המחדל). הבודקים כותבים רק מפתחות עם קידומת <code>chk:</code> ומוחקים אותם בסוף.</li>
<li>תוסף VS Code (לא חובה): <a href="https://marketplace.visualstudio.com/items?itemName=redis.redis-for-vscode" target="_blank">Redis for VS Code</a> — לראות מפתחות וערכים בזמן שהקוד רץ. אותו דבר בטרמינל: <code>docker exec -it redis redis-cli</code>.</li>
</ul>
${copyStep("26-redis")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P26-E06</code> ← הבודק מתחבר ל־Redis ונכשל על קובץ ההתחלה. <code>npm install</code> מוסיף את <code>ioredis</code>, <code>bullmq</code> ו־<code>ws</code> (WebSocket, לשיעור 6); אם הבודק כותב <code>ECONNREFUSED 127.0.0.1:6379</code> — הקונטיינר לא רץ.</p>`,
  goals: [
    "להבין מה Redis טוב בו ומה לא: זיכרון, מבני נתונים, TTL, ופקודות אטומיות — ומתי PostgreSQL מספיק.",
    "cache-aside: מפתחות, TTL, ביטול עם גרסה, stampede — ולמדוד את ההבדל בעצמך.",
    "מצב משותף לכמה שרתים: הגבלת קצב, מנעולים, pub/sub ו־Lua.",
    "תורים עם BullMQ: עבודות ברקע, ניסיונות חוזרים, עיכוב, at-least-once וצרכן idempotent.",
    "פרויקט 3, שלב 5: cache לקטלוג, מייל אישור בתור, וביטול אוטומטי של הזמנות שלא שולמו.",
    "זמן אמת: SSE ו־WebSocket, אימות לפני ה־upgrade, ו־fan-out בין שרתים דרך Redis.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>חנות הקפה עובדת. עכשיו שלוש בעיות של "מערכת אמיתית": דף הקטלוג נקרא אלף פעמים על כל פעם שהוא משתנה — ובכל פעם הולך למסד; מייל האישור נשלח בתוך הבקשה של התשלום — ואם שרת המייל איטי, הלקוח מחכה (ואם הוא נופל — התשלום "נכשל"?); והזמנה שלא שולמה מחזיקה מלאי לנצח. ועוד אחת שנשארה מפרק 24: הגבלת הקצב סופרת בזיכרון של <em>תהליך אחד</em> — עם שלושה שרתים היא לא עובדת. לכל אלה יש כלי אחד שמופיע כמעט בכל מודעת דרושים: <strong>Redis</strong>.</p>`,
  lessons: [
    { file: "lesson-01-redis.html", title: "Redis: מבני נתונים בזיכרון", minutes: 45 },
    { file: "lesson-02-cache.html", title: "מטמון: cache-aside, ביטול ו־stampede", minutes: 50 },
    { file: "lesson-03-shared.html", title: "מצב משותף: הגבלת קצב, מנעולים ו־Lua", minutes: 45 },
    { file: "lesson-04-queues.html", title: "תורים ועבודות ברקע עם BullMQ", minutes: 50 },
    { file: "lesson-05-project.html", title: "פרויקט 3, שלב 5: Redis בחנות", minutes: 90, note: "🤖 PR3-REDIS" },
    { file: "lesson-06-realtime.html", title: "זמן אמת: SSE, WebSocket ו־fan-out", minutes: 50 },
  ],
  glossary: [
    ["SSE (Server-Sent Events)", "אֶס־אֶס־אִי", "בקשת HTTP שנשארת פתוחה, והשרת כותב אליה אירועים (text/event-stream); הדפדפן מתחבר מחדש לבד"],
    ["WebSocket", "וֶוב־סוֹקֶט", "חיבור דו־כיווני שמתחיל כבקשת HTTP עם Upgrade, ומשם שני הצדדים שולחים הודעות"],
    ["Last-Event-ID", "לַאסְט אִיוֶונְט אַיי־דִי", "header שהדפדפן שולח כשהוא מתחבר מחדש ל־SSE — כדי לקבל רק את מה שפספס"],
    ["Heartbeat", "הַארְטְבִּיט", "הודעה קטנה וקבועה (ping / הערה) שמחזיקה חיבור פתוח ומגלה חיבורים מתים"],
    ["Fan-out", "פֶאן־אַאוּט", "הפצה של אירוע אחד להרבה מקבלים — למשל ללקוחות של כל השרתים, דרך pub/sub"],
    ["Redis", "רֶדִיס", "מסד נתונים בזיכרון: מפתח ← ערך (מחרוזת, רשימה, hash, set, sorted set), עם TTL ופקודות אטומיות"],
    ["Cache (מטמון)", "קֶאשׁ", "עותק מהיר של תשובה שחישובה יקר; לא מקור האמת"],
    ["Cache-aside", "קֶאשׁ אָסַייד", "הקוד בודק ב־cache, ואם אין — טוען מהמסד ושומר"],
    ["Hit / Miss", "הִיט / מִיס", "נמצא ב־cache / לא נמצא, הלכנו למסד"],
    ["TTL", "טִי־טִי־אֶל", "Time To Live: אחרי כמה שניות המפתח נמחק לבד"],
    ["Invalidation", "אִינְוָולִידֵיישֶׁן", "ביטול ערכים ב־cache כשהמקור השתנה"],
    ["Stampede", "סְטַמְפִּיד", "הרבה בקשות מגלות miss יחד, וכולן הולכות למסד באותו רגע"],
    ["Sorted set (ZSET)", "סוֹרְטֶד סֶט", "קבוצה שכל איבר בה עם ניקוד, ממוינת — דירוגים, חלונות זמן"],
    ["Atomic", "אָטוֹמִי", "פעולה שאי אפשר \"להיכנס באמצעה\" — INCR, SET NX, סקריפט Lua"],
    ["Distributed lock", "דִיסְטְרִיבְּיוּטֶד לוֹק", "מנעול שכמה שרתים חולקים — SET NX PX עם token"],
    ["Pub/Sub", "פַּאבּ/סַאבּ", "פרסום הודעה לכל מי שמנוי לערוץ, ברגע זה (בלי שמירה)"],
    ["Queue / Job / Worker", "קְיוּ / ג'וֹבּ / וֶורְקֶר", "תור עבודות; עבודה = יחידה עם נתונים; worker = מי שמעבד"],
    ["BullMQ", "בּוּל אֶם־קְיוּ", "ספריית תורים ל־Node.js מעל Redis"],
    ["Backoff", "בֶּקְאוֹף", "המתנה הולכת וגדלה בין ניסיונות חוזרים"],
    ["At-least-once", "אֶט לִיסְט וָואנְס", "כל עבודה תרוץ לפחות פעם אחת — אולי יותר. לכן הצרכן idempotent"],
    ["Outbox", "אָאוּטְבּוֹקְס", "טבלה שבה נרשם \"מה צריך לשלוח\", באותה טרנזקציה של השינוי"],
  ],
  passTest: `<ul class="check">
<li>להסביר מתי Redis ומתי PostgreSQL — ומה קורה לנתונים ב־Redis כשהוא מתאתחל.</li>
<li>לבחור מבנה נתונים מתאים: מונה, דירוג, "צפית לאחרונה", "כבר עובד".</li>
<li>לכתוב cache-aside עם TTL וביטול, ולהסביר stampede ואיך מונעים.</li>
<li>להסביר למה <code>GET</code> ואז <code>SET</code> שבור תחת עומס, ומה מתקן: INCR, SET NX, Lua.</li>
<li>לכתוב תור עם ניסיונות חוזרים ועיכוב, ולהסביר at-least-once וצרכן idempotent.</li>
<li>לבחור בין polling, SSE ו־WebSocket, ולהסביר איך אירוע מגיע ללקוחות של כמה שרתים.</li>
<li>פרויקט 3: PR3-REDIS עובר, וכל בודקי PR3 הקודמים עדיין עוברים.</li>
<li><code>npm run check P26</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
