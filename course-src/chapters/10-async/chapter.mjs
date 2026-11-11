import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 10,
  code: "10",
  title: "אסינכרוניות",
  part: "חטיבה א׳ — יסודות JavaScript",
  checker: true,
  time: "4–5 מפגשים",
  expectedExercises: 82,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js 24+, הבודק האוטומטי.</p>
<p><strong>מה מתקינים עכשיו:</strong> כלום.</p>
${copyStep("10-async")}
${verifyNode}
<p><strong>שים לב:</strong> רוב הדוגמאות בפרק נכתבות כ־ES Modules (קובצי <code>.mjs</code>), כי שם מותר <code>await</code> ישירות בקובץ.</p>`,
  goals: [
    "להבין למה שרת לא יכול \"לחכות\" לפעולות איטיות, ומה זה event loop.",
    "לקרוא ולכתוב callbacks בסגנון error-first.",
    "ליצור Promises ולשרשר אותן עם `then`/`catch`/`finally`.",
    "לכתוב קוד אסינכרוני קריא עם `async`/`await` ו־`try/catch`.",
    "להריץ פעולות במקביל (`Promise.all`, `allSettled`, `race`) ולבחור בין רצף למקביליות.",
    "לטפל בתוצאה שמאחרת או נכשלת: timeout, retry, ושגיאות שלא נתפסו.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>כמעט כל מה ששרת עושה — קריאה ממסד נתונים, קריאה לשרת אחר, קריאת קובץ — לוקח זמן: עשרות או מאות מילישניות. בזמן הזה, שרת Node אחד צריך להמשיך לשרת אלפי בקשות אחרות. אם הוא "יעצור ויחכה" לכל פעולה — הוא יהיה איטי עד חוסר שימוש. קוד אסינכרוני אומר: "תתחיל את הפעולה, תמשיך בדברים אחרים, ותחזור אליי כשיש תוצאה". זה לב העבודה עם Node.</p>`,
  lessons: [
    { file: "lesson-01-event-loop.html", title: "סינכרוני, אסינכרוני ו־event loop", minutes: 35 },
    { file: "lesson-02-callbacks.html", title: "callbacks ו־error-first", minutes: 25 },
    { file: "lesson-03-promises.html", title: "Promises", minutes: 40 },
    { file: "lesson-04-async-await.html", title: "async/await, מקביליות וכשלים", minutes: 45, note: "כולל יחידת גישור" },
  ],
  glossary: [
    ["Synchronous", "סִינְכְּרוֹנִי", "פעולה שהתוכנית מחכה לסופה לפני שממשיכה"],
    ["Asynchronous", "אָסִינְכְּרוֹנִי", "פעולה שמתחילה עכשיו ומסתיימת אחר כך, בלי לעצור את התוכנית"],
    ["Event loop", "אִיוֶונְט לוּפּ", "המנגנון של Node שמריץ callbacks כשהפעולות שלהם מסתיימות"],
    ["Callback", "קוֹלְבֶּק", "פונקציה שנקראת כשפעולה מסתיימת"],
    ["Error-first callback", "אֶרוֹר־פֶרְסְט", "מוסכמה: הפרמטר הראשון הוא שגיאה (או `null`)"],
    ["Promise", "פְּרוֹמִיס", "\"הבטחה\" — אובייקט שמייצג תוצאה עתידית"],
    ["Pending / Fulfilled / Rejected", "פֶּנְדִינְג / פוּלְפִילְד / רִיגֶ'קְטֶד", "מצבי Promise: ממתין / הצליח / נכשל"],
    ["resolve / reject", "רִיזוֹלְב / רִיגֶ'קְט", "הפונקציות שמסיימות Promise בהצלחה / בכישלון"],
    ["async / await", "אַסִינְק / אַוֵויט", "תחביר שמאפשר לכתוב קוד אסינכרוני שנראה כמו רגיל"],
    ["Promise.all", "פְּרוֹמִיס אוֹל", "מחכה שכל ההבטחות יצליחו (נכשל אם אחת נכשלה)"],
    ["Promise.allSettled", "סֶטֶלְד", "מחכה לכולן, ומחזיר את התוצאה של כל אחת — הצלחה או כישלון"],
    ["Promise.race", "רֵייס", "התוצאה של הראשונה שמסתיימת"],
    ["Timeout", "טַיים־אַאוּט", "הגבלת זמן — אם לא הסתיים בזמן, מוותרים"],
    ["Unhandled rejection", "אַנְהֶנְדְלְד", "Promise שנכשל ואף אחד לא תפס — Node קורס"],
  ],
  passTest: `<ul class="check">
<li>לנבא את סדר ההדפסות בקוד שמשלב <code>console.log</code>, <code>setTimeout</code> ו־<code>Promise</code>, ולהסביר למה.</li>
<li>להמיר פונקציה עם callback לפונקציה שמחזירה Promise, ולהשתמש בה עם <code>await</code>.</li>
<li>לכתוב פונקציה שמביאה 3 דברים במקביל ומטפלת בכישלון של אחד מהם בלי לאבד את השניים האחרים.</li>
<li>להוסיף timeout לפעולה אסינכרונית.</li>
<li><code>npm run check P10</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
