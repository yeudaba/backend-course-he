import { copyStep } from "../../lib.mjs";

export default {
  num: 25.7,
  code: "25.7",
  label: "יחידה 25.7",
  title: "MongoDB: מסד של מסמכים",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true, // E25 מעביר מ־PostgreSQL ל־MongoDB
  testTimeout: 120000,
  time: "3 מפגשים",
  expectedExercises: 100,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Docker Desktop (פרק 23), ו־PostgreSQL מפרק 16 (לתרגיל E25).</p>
<p><strong>מה מתקינים / מריצים עכשיו:</strong></p>
<ul>
<li>MongoDB 8 בקונטיינר, כ־<em>replica set</em> של שרת אחד — זה מה שמאפשר טרנזקציות (שיעור 5). פעם אחת:
<pre class="mono">docker run -d --name mongo -p 27017:27017 mongo:8 --replSet rs0
docker exec mongo mongosh --quiet --eval "rs.initiate()"</pre>
אחר כך רק <code>docker start mongo</code>.</li>
<li>בדיקה: <code>docker exec -it mongo mongosh --quiet --eval "db.version()"</code> ← <code>8.x</code>. ו־<code>docker exec -it mongo mongosh</code> פותח shell אינטראקטיבי (<code>exit</code> ליציאה).</li>
<li>ב־<code>~/dev/backend-course/.env</code>: <code>COURSE_MONGO_URL=mongodb://localhost:27017/?directConnection=true</code>. הבודקים יוצרים database זמני לכל בדיקה ומוחקים אותו בסוף.</li>
<li><code>npm install</code> בתיקיית הקורס — מוסיף את <code>mongodb</code>, ה־driver הרשמי ל־Node.js.</li>
<li>נתוני הדוגמה (חנות הקפה, כמסמכים) ל־database בשם <code>shop</code>: <code>node 25w-mongodb/files/load-seed.mjs</code>.</li>
<li>תוסף VS Code (לא חובה): <a href="https://marketplace.visualstudio.com/items?itemName=mongodb.mongodb-vscode" target="_blank">MongoDB for VS Code</a> — לראות collections ולהריץ שאילתות מתוך העורך. או <a href="https://www.mongodb.com/products/tools/compass" target="_blank">MongoDB Compass</a>.</li>
</ul>
${copyStep("25w-mongodb")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P25.7-E06</code> ← הבודק מתחבר ל־MongoDB ונכשל על קובץ ההתחלה. <code>ECONNREFUSED 127.0.0.1:27017</code> — הקונטיינר לא רץ. <code>This MongoDB deployment does not support retryable writes</code> — הקונטיינר רץ בלי <code>--replSet rs0</code> או בלי <code>rs.initiate()</code>.</p>`,
  goals: [
    "להבין את מודל המסמכים: collection, מסמך, _id ו־ObjectId, BSON — ומה שונה מטבלה.",
    "לשאול ולעדכן: אופרטורים, מערכים ומסמכים מקוננים, $set/$inc/$push/$addToSet, upsert — ועדכון אטומי עם תנאי.",
    "לתכנן מבנה לפי דפוסי הגישה: embed מול reference, שכפול מכוון, ומתי מערך גדל לנצח.",
    "aggregation pipeline ($match, $unwind, $group, $lookup, $facet) ואינדקסים (ESR, unique, TTL, explain).",
    "MongoDB מ־Node.js: driver, ObjectId ב־API, collections עם טיפוסים, טרנזקציות — ומתי לבחור Mongo ומתי PostgreSQL.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרקים 16–19 וביחידה 25.5 עבדת עם מסדים רלציוניים: טבלאות, שורות, JOIN. הרבה צוותים בארץ — במיוחד עם Node.js — עובדים עם <strong>MongoDB</strong>: מסד של <em>מסמכים</em>, שבו הזמנה עם כל הפריטים שלה היא אובייקט JSON אחד, בלי טבלת <code>order_items</code>. ב־stack של Node הוא נפוץ במיוחד, ובמודעות הוא מופיע לצד PostgreSQL ו־MySQL.</p>
<p>היחידה לא מנסה לשכנע אותך ש־Mongo "טוב יותר" — אלא שתדע לעבוד איתו, להבין מתי הוא מתאים, ולענות בראיון על השאלה "Mongo או Postgres?" בלי סיסמאות. הכול על חנות הקפה המוכרת, כמסמכים, ומול MongoDB 8 אמיתי בקונטיינר.</p>`,
  lessons: [
    { file: "lesson-01-documents.html", title: "מסמכים במקום שורות", minutes: 45 },
    { file: "lesson-02-queries.html", title: "שאילתות ועדכונים", minutes: 50 },
    { file: "lesson-03-modeling.html", title: "תכנון מבנה: embed או reference", minutes: 45 },
    { file: "lesson-04-aggregation.html", title: "aggregation ואינדקסים", minutes: 50 },
    { file: "lesson-05-node.html", title: "Node.js, טרנזקציות — ו־Mongo או Postgres?", minutes: 50 },
  ],
  glossary: [
    ["MongoDB", "מוֹנְגוֹ־דִי־בִּי", "מסד נתונים של מסמכים (document database): כל רשומה היא אובייקט JSON־י גמיש"],
    ["Document", "דוֹקְיוּמֶנְט", "רשומה אחת ב־Mongo: אובייקט עם שדות, מערכים ומסמכים מקוננים"],
    ["Collection", "קוֹלֶקְשֶׁן", "קבוצת מסמכים — המקבילה (הגמישה) לטבלה"],
    ["BSON", "בִּיסוֹן", "Binary JSON: הפורמט שבו Mongo שומר מסמכים — עם טיפוסים שאין ב־JSON (Date, ObjectId, Int32, Decimal128)"],
    ["ObjectId", "אוֹבְּגֶ'קְט אַיי־דִי", "מזהה ברירת המחדל: 12 בתים (24 תווי hex), מתחיל בזמן היצירה"],
    ["Embedding", "אֶמְבֶּדִינְג", "לשמור נתונים קשורים בתוך אותו מסמך (פריטי הזמנה בתוך ההזמנה)"],
    ["Reference", "רֶפֶרֶנְס", "לשמור רק מזהה של מסמך אחר (customerId), ולחבר כשצריך"],
    ["Aggregation pipeline", "אַגְרֶגֵיישֶׁן פַּייפְּלַיין", "שאילתה כרשימת שלבים ($match, $group, $lookup…) שכל אחד מקבל את הפלט של הקודם"],
    ["$lookup", "לוּקְאַפּ", "השלב שמחבר מסמכים מ־collection אחר — ה־LEFT JOIN של Mongo"],
    ["ESR rule", "אִי־אֶס־אַר", "סדר שדות באינדקס מורכב: Equality, ואז Sort, ואז Range"],
    ["TTL index", "טִי־טִי־אֶל אִינְדֶקְס", "אינדקס שגורם ל־Mongo למחוק מסמכים לבד אחרי שהזמן שבשדה עבר"],
    ["Replica set", "רֶפְּלִיקָה סֶט", "קבוצת שרתים עם אותם נתונים: primary אחד ו־secondaries. נדרש לטרנזקציות ול־change streams"],
    ["Schema validation", "סְכֵמָה וָלִידֵיישֶׁן", "כללי $jsonSchema שהשרת בודק בכל כתיבה ל־collection"],
    ["NoSQL injection", "נוֹ־אֶס־קְיוּ־אֶל אִינְגֶ'קְשֶׁן", "קלט שהוא אובייקט ({ \"$ne\": null }) במקום ערך, שהופך את הפילטר למשהו אחר"],
  ],
  passTest: `<ul class="check">
<li>להסביר מה ההבדל בין מסמך לשורה, ולמה <code>_id</code> הוא בדרך כלל ObjectId.</li>
<li>לכתוב find עם אופרטורים על מערכים ושדות מקוננים, ועדכון אטומי עם תנאי (<code>stock: { $gte: qty }</code>).</li>
<li>להחליט embed או reference לפי דפוסי גישה — ולהסביר למה בהזמנה שומרים עותק של המחיר.</li>
<li>לכתוב aggregation עם $unwind, $group ו־$lookup, ולבנות אינדקס מורכב לפי ESR ולבדוק אותו עם explain.</li>
<li>להשתמש בטרנזקציה עם session, ולהסביר מתי בכלל צריך אותה ב־Mongo.</li>
<li>לענות על "Mongo או Postgres?" עם שיקולים ולא עם סיסמאות.</li>
<li><code>npm run check P25.7</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
