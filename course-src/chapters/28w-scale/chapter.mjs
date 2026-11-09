import { copyStep } from "../../lib.mjs";

export default {
  num: 28.5,
  code: "28.5",
  label: "יחידה 28.5",
  title: "ביצועים ונתונים בקנה מידה",
  part: "חטיבה ה׳ — ראיונות והרחבות",
  checker: true,
  database: true, // E12, E25 — PostgreSQL
  testTimeout: 60000,
  time: "4 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> PostgreSQL מפרק 16. בלי קונטיינרים חדשים.</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li><code>npm install</code> בתיקיית הקורס — מוסיף את <code>@duckdb/node-api</code>: <strong>DuckDB</strong>, מנוע SQL אנליטי (עמודתי) שרץ <em>בתוך</em> תהליך ה־Node, בלי שרת — וקורא Parquet, CSV ו־JSON ישירות. (חבילה עם רכיב native; npm מוריד את הגרסה המתאימה ל־Mac/Windows/Linux אוטומטית.)</li>
<li>לא חובה — <code>npx autocannon</code> (בדיקת עומס מהטרמינל) ו־<a href="https://clinicjs.org" target="_blank">clinic</a> (פרופיילינג). בתרגילים לא צריך אותם.</li>
</ul>
${copyStep("28w-scale")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P28.5-E15</code> ← הבודק טוען 60,000 הזמנות מ־<code>files/orders.parquet</code> ל־DuckDB, ונכשל על הקובץ הריק שלך.</p>`,
  goals: [
    "למדוד נכון: percentiles במקום ממוצע, histograms שמתאחדים, בדיקת עומס, וחוק Little לתכנון קיבולת.",
    "Node.js תחת עומס: מה חוסם את ה־event loop, thread pool מול worker threads, ומוניטור lag.",
    "נתונים גדולים בזרם: streams, NDJSON, backpressure, הכנסה מרוכזת ודגימה.",
    "OLTP מול OLAP: אחסון עמודתי, Parquet ו־DuckDB, partitions, ועלות שאילתה במחסני נתונים (BigQuery, Snowflake, Databricks).",
    "לחבר הכול: data lake מצטבר מ־PostgreSQL, ו־API אנליטי שעומד ב־SLO.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>"נפחי נתונים גדולים ותעבורה גבוהה" — כך מסתיימות הרבה מודעות דרושים, והן מתכוונות לשני דברים. הראשון: שרת שמקבל אלפי בקשות בשנייה, ושבו בקשה אחת שחוסמת את ה־event loop עוצרת את כולם; שם לא שואלים "זה עובד?" אלא "מה ה־p99, ומה יקרה בשיא?". השני: טבלאות של מיליארדי שורות, שאילתות אנליטיות שסורקות אותן, ו־BigQuery, Snowflake או Databricks שמחייבים לפי כל בית שנסרק. בפרק 28 תכננת מערכות על הלוח; ביחידה הזו תמדוד, תמצא צווארי בקבוק, ותעבוד עם נתונים בצורה שבה עובדים איתם בקנה מידה — עמודות, partitions, streams — עם DuckDB שרץ אצלך בתוך Node.</p>`,
  lessons: [
    { file: "lesson-01-measure.html", title: "למדוד: percentiles, histograms ובדיקת עומס", minutes: 45 },
    { file: "lesson-02-event-loop.html", title: "Node.js תחת עומס: event loop, thread pool ו־workers", minutes: 45 },
    { file: "lesson-03-streams.html", title: "נתונים גדולים בזרם", minutes: 40 },
    { file: "lesson-04-columnar.html", title: "עמודות: Parquet, DuckDB ומחסני נתונים", minutes: 55 },
    { file: "lesson-05-pipeline.html", title: "מ־PostgreSQL ל־data lake ובחזרה ל־API", minutes: 45 },
  ],
  glossary: [
    ["Percentile (p99)", "פֶּרְסֶנְטַייל", "הערך ש־99% מהמדידות קטנות ממנו או שוות לו"],
    ["SLO", "אֶס־אֶל־אוֹ", "יעד שירות מדיד: \"99% מהבקשות מתחת ל־300ms\""],
    ["Histogram", "הִיסְטוֹגְרָם", "ספירה לפי דליים — דרך זולה לשמור התפלגות ולאחד בין שרתים"],
    ["Throughput", "תְּרוּפּוּט", "כמה בקשות (או שורות) בשנייה"],
    ["Little's law", "חוק לִיטֶל", "בתהליך בממוצע = קצב × זמן"],
    ["Event loop lag", "אִיוֶונְט לוּפּ לַאג", "כמה זמן callback מחכה לתורו — מדד לחסימה"],
    ["Worker thread", "וֶורְקֶר תְ'רֶד", "thread נוסף עם JavaScript משלו, לעבודת CPU"],
    ["Backpressure", "בֶּקְפְּרֶשֶׁר", "מנגנון שמאט את מי שמייצר נתונים כשמי שצורך לא עומד בקצב"],
    ["NDJSON", "אֶן־דִי־ג׳ייסון", "אובייקט JSON בכל שורה — פורמט נוח לזרמים ולקבצים ענקיים"],
    ["OLTP / OLAP", "אוֹ־אֶל־טִי־פִּי / אוֹ־לַאפּ", "עבודה טרנזקציונית (שורות בודדות) / אנליטית (סריקות גדולות)"],
    ["Columnar storage", "קוֹלוּמְנָר", "אחסון עמודה אחרי עמודה — שאילתה קוראת רק מה שצריך, ודוחס טוב"],
    ["Parquet", "פַּרְקֶט", "פורמט קבצים עמודתי, הסטנדרט ל־data lakes"],
    ["DuckDB", "דַאק־דִי־בִּי", "מנוע SQL אנליטי שרץ בתוך התהליך — \"SQLite לאנליטיקה\""],
    ["Partition pruning", "פַּרְטִישֶׁן פְּרוּנִינְג", "לדלג על חלקים שלמים של הטבלה לפי WHERE"],
    ["Data lake", "דֵאטָה לֵייק", "קבצים (בדרך כלל Parquet ב־S3) כמקור לאנליטיקה"],
    ["ETL / ELT", "אִי־טִי־אֶל", "Extract, Transform, Load — להעתיק נתונים מהמערכת למחסן"],
    ["HyperLogLog", "הַייפֶּר־לוֹג־לוֹג", "אלגוריתם שמעריך כמה ערכים שונים — בזיכרון קבוע וזעיר"],
  ],
  passTest: `<ul class="check">
<li>להסביר למה ממוצע מטעה, לחשב p50/p95/p99, ולמה אי אפשר למצע p99 בין שרתים.</li>
<li>להריץ בדיקת עומס, ולתכנן כמה instances וחיבורי מסד צריך לשיא.</li>
<li>לזהות קוד שחוסם את ה־event loop, ולבחור בין API אסינכרוני ל־worker threads.</li>
<li>לעבד קובץ ענק בזרם, בזיכרון קבוע — כולל שורות ותווים שנחתכים בין chunks.</li>
<li>להסביר OLTP מול OLAP, אחסון עמודתי ו־partitions, ולהעריך כמה בתים שאילתה תסרוק.</li>
<li>לכתוב SQL אנליטי ב־DuckDB על Parquet.</li>
<li><code>npm run check P28.5</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
