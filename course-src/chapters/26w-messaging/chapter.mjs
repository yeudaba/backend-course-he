import { copyStep } from "../../lib.mjs";

export default {
  num: 26.5,
  code: "26.5",
  label: "יחידה 26.5",
  title: "תורים ואירועים: RabbitMQ, Kafka ו־SQS",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  database: true, // E15, E17, E23, E25 — outbox ואידמפוטנטיות ב־PostgreSQL
  testTimeout: 60000,
  time: "4 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Docker Desktop, PostgreSQL מפרק 16, ו־LocalStack מיחידה 26.3 (לתרגילי SQS).</p>
<p><strong>מה מתקינים / מריצים עכשיו</strong> (פעם אחת; אחר כך <code>docker start rabbitmq kafka</code>):</p>
<ul>
<li><strong>RabbitMQ 4</strong>:
<pre class="mono">docker run -d --name rabbitmq -p 5672:5672 rabbitmq:4-alpine</pre></li>
<li><strong>Kafka 4.1</strong> — broker אחד במצב KRaft (בלי ZooKeeper). ה־image הרשמי עולה עם הגדרות ברירת מחדל שמתאימות בדיוק לזה:
<pre class="mono">docker run -d --name kafka -p 9092:9092 apache/kafka:4.1.0</pre></li>
<li>בדיקה: <code>docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list</code> ← בלי שגיאה (רשימה ריקה). ו־<code>docker logs rabbitmq | grep "Server startup complete"</code>.</li>
<li>ב־<code>~/dev/backend-course/.env</code>: <code>COURSE_RABBIT_URL=amqp://localhost:5672</code> ו־<code>COURSE_KAFKA_BROKERS=localhost:9092</code>.</li>
<li><code>npm install</code> בתיקיית הקורס — מוסיף את <code>amqplib</code> (RabbitMQ) ואת <code>@platformatic/kafka</code> (לקוח Kafka מודרני, ב־TypeScript, בלי רכיבים native).</li>
</ul>
${copyStep("26w-messaging")}
<p><strong>✔ בדיקה:</strong> <code>cd ~/dev/backend-course && npm install && npm run check P26.5-E06</code> ← הבודק מתחבר ל־RabbitMQ ונכשל על הקובץ הריק. <code>ECONNREFUSED 127.0.0.1:5672</code> — הקונטיינר לא רץ.</p>`,
  goals: [
    "להבין מתי תור ומתי log, at-most-once מול at-least-once — ולמה consumer חייב להיות אידמפוטנטי.",
    "RabbitMQ: exchanges, bindings, ack/nack, prefetch, dead letters ו־retry עם השהיה.",
    "SQS: Standard מול FIFO, visibility timeout, long polling, batches ו־DLQ — מול LocalStack.",
    "Kafka: topics, partitions, keys, consumer groups, offsets ו־commit אחרי טיפול; lag.",
    "דפוסי אמינות: outbox, idempotent consumer, backoff עם jitter, מעטפת וגרסאות לאירועים — ו־exactly-once מול מסד.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>בפרק 26 שלחת מייל אישור ברקע עם BullMQ: שרת אחד, Redis אחד, תור אחד. כשהמערכת גדלה לעשרות שירותים — הזמנות, תשלומים, מלאי, מיילים, אנליטיקה — הם מדברים ביניהם ב<strong>הודעות</strong>, לא בקריאות HTTP ישירות: שירות ההזמנות לא מחכה לשירות המיילים, ולא נופל כשהוא נופל. המודעה שראית ביקשה "SQS/Kafka/RabbitMQ" — שלושת הכלים הנפוצים לזה, כל אחד עם מודל אחר. ביחידה הזו תריץ את שלושתם, תבין מתי כל אחד, ובעיקר — את מה שמשותף להם: הודעות מגיעות פעמיים, לא בסדר, או בכלל לא, אם לא בונים נכון. מי שיודע לענות בראיון "איך תמנע חיוב כפול כש־consumer נופל?" — עבר את החלק הקשה.</p>`,
  lessons: [
    { file: "lesson-01-why.html", title: "למה הודעות: תור מול log, והבטחות מסירה", minutes: 40 },
    { file: "lesson-02-rabbitmq.html", title: "RabbitMQ: exchanges, ack ו־dead letters", minutes: 50 },
    { file: "lesson-03-sqs.html", title: "SQS: visibility timeout, FIFO ו־DLQ", minutes: 40 },
    { file: "lesson-04-kafka.html", title: "Kafka: partitions, keys ו־consumer groups", minutes: 55 },
    { file: "lesson-05-reliability.html", title: "אמינות: אידמפוטנטיות, outbox ו־retries", minutes: 50 },
  ],
  glossary: [
    ["Message broker", "מֶסֶג׳ בְּרוֹקֶר", "שרת שמקבל הודעות מ־producers ומעביר ל־consumers"],
    ["Producer / Consumer", "פְּרוֹדְיוּסֶר / קוֹנְסְיוּמֶר", "מי ששולח הודעות / מי שקורא ומטפל"],
    ["Ack / Nack", "אַק / נַאק", "אישור שההודעה טופלה (ואפשר למחוק) / דחייה"],
    ["At-least-once", "אֶט־לִיסְט־וַואנְס", "כל הודעה מטופלת לפחות פעם אחת — לפעמים יותר"],
    ["Idempotent", "אַיידֶמְפּוֹטֶנְט", "פעולה שפעמיים נותנת אותה תוצאה כמו פעם אחת"],
    ["Exchange", "אֶקְסְצֵ׳יינְג׳", "ב־RabbitMQ: מקבל הודעות ומנתב לתורים לפי bindings"],
    ["Routing key", "רָאוּטִינְג קִי", "המחרוזת שלפיה exchange מחליט לאן הודעה הולכת"],
    ["Prefetch", "פְּרִי־פֶטְשׁ", "כמה הודעות לא מאושרות consumer מחזיק בבת אחת"],
    ["Dead letter queue (DLQ)", "דֶד לֶטֶר קְיוּ", "תור להודעות שנכשלו שוב ושוב — לבדיקה ידנית"],
    ["Visibility timeout", "וִיזִיבִּילִיטִי טַיימְאָוּט", "ב־SQS: כמה זמן הודעה שהתקבלה מוסתרת מאחרים"],
    ["Topic / Partition", "טוֹפִּיק / פַּרְטִישֶׁן", "ב־Kafka: זרם אירועים, מחולק לחלקים מסודרים"],
    ["Offset", "אוֹפְסֶט", "המיקום של הודעה בתוך partition"],
    ["Consumer group", "קוֹנְסְיוּמֶר גְּרוּפּ", "קבוצת consumers שמתחלקים ב־partitions; לכל group — offsets משלו"],
    ["Consumer lag", "קוֹנְסְיוּמֶר לַאג", "כמה הודעות ה־group עוד לא קרא"],
    ["Outbox", "אָאוּטְבּוֹקְס", "טבלה שבה נשמרים אירועים באותה טרנזקציה עם הנתונים, ונשלחים אחר כך"],
    ["Backoff + jitter", "בֶּקְאוֹף וְגִ׳יטֶר", "השהיה שגדלה בין ניסיונות, עם רכיב אקראי"],
  ],
  passTest: `<ul class="check">
<li>לבחור בין BullMQ, RabbitMQ, SQS ו־Kafka לתרחיש, ולהסביר למה.</li>
<li>להסביר at-most-once מול at-least-once, ולכתוב consumer אידמפוטנטי.</li>
<li>להגדיר ב־RabbitMQ topic exchange, prefetch ו־dead letter — ולהסביר למה nack עם requeue הוא מלכודת.</li>
<li>להסביר visibility timeout ו־DLQ ב־SQS, ולכתוב consumer עם long polling.</li>
<li>להסביר partitions, keys ו־consumer groups ב־Kafka, ולמה commit אחרי טיפול.</li>
<li>להסביר transactional outbox ולמה "שמור ושלח" בלי outbox שבור.</li>
<li><code>npm run check P26.5</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
