import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 14,
  code: "14",
  title: "HTTP ורשת בסיסית",
  part: "חטיבה ב׳ — TypeScript ו־Node.js",
  checker: true,
  time: "4 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+, VS Code, Google Chrome (פרק 0).</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li><strong>curl</strong> — כבר מותקן ב־Mac. בדיקה: <code>curl --version</code>.</li>
<li>תוסף <a href="https://marketplace.visualstudio.com/items?itemName=humao.rest-client" target="_blank">REST Client</a> ל־VS Code (מזהה <code>humao.rest-client</code>) — שליחת בקשות מתוך קובץ <code>.http</code>, עם תוצאה בחלון צד.</li>
</ul>
${copyStep("14-http")}
${verifyNode}
<p><strong>✔ שרת ההדגמה:</strong> <code>node 14-http/files/demo-server.mjs</code> ← אמור להופיע <code>שרת ההדגמה רץ: http://localhost:4000</code>. פתח את הכתובת ב־Chrome — תראה JSON. עצירה: <kbd>Ctrl</kbd>+<kbd>C</kbd>.</p>`,
  goals: [
    "להסביר מה קורה מרגע שמקלידים כתובת ועד שמגיעה תשובה: URL, DNS, בקשה, תשובה.",
    "לקרוא ולבנות בקשת HTTP: method, path, query, headers, body — ותשובה: status, headers, body.",
    "לבחור status code נכון, ולהבין את ההבדל בין GET, POST, PUT, PATCH ו־DELETE.",
    "לשלוח בקשות עם curl, REST Client ו־DevTools של Chrome.",
    "לכתוב שרת HTTP בסיסי עם `node:http`, וללקוח עם `fetch` — כולל timeout.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>זה הפרק שבו "Backend" מקבל משמעות: שרת הוא תוכנה שמקבלת <strong>בקשות HTTP</strong> ומחזירה <strong>תשובות HTTP</strong>. כל מה שבנית עד עכשיו — לוגיקה, validation, שגיאות — יישב מאחורי השכבה הזו. מראיינים שואלים על HTTP כמעט תמיד ("מה ההבדל בין PUT ל־PATCH?", "מתי 401 ומתי 403?"), ובלי להבין אותו קשה מאוד לדבג שרת.</p>`,
  lessons: [
    { file: "lesson-01-request-response.html", title: "בקשה ותשובה: URL, methods ו־status", minutes: 40 },
    { file: "lesson-02-headers-json.html", title: "headers, JSON ו־stateless", minutes: 30 },
    { file: "lesson-03-tools.html", title: "כלים: curl, REST Client ו־DevTools", minutes: 35 },
    { file: "lesson-04-node-http.html", title: "שרת עם node:http ולקוח עם fetch", minutes: 45 },
  ],
  glossary: [
    ["HTTP", "אֵייץ'־טִי־טִי־פִּי", "הפרוטוקול שבו דפדפנים ושרתים מדברים"],
    ["Client / Server", "קְלַיינְט / סֶרְבֶר", "מי ששולח בקשה / מי שעונה"],
    ["URL", "יוּ־אַר־אֶל", "כתובת: פרוטוקול, host, port, path, query"],
    ["DNS", "דִי־אֶן־אֶס", "\"ספר הטלפונים\" שמתרגם שם (example.com) לכתובת IP"],
    ["Port", "פּוֹרְט", "\"מספר דירה\" בשרת — איזו תוכנה מקבלת את הבקשה"],
    ["Method / Verb", "מֶת'וֹד", "GET, POST, PUT, PATCH, DELETE — מה רוצים לעשות"],
    ["Path", "פַּאת׳", "החלק שאחרי הדומיין: `/products/7`"],
    ["Query string", "קְוֶורִי", "פרמטרים אחרי `?`: `?page=2&sort=price`"],
    ["Header", "הֶדֶר", "שורת מידע נוספת: `Content-Type: application/json`"],
    ["Body", "בּוֹדִי", "גוף הבקשה/התשובה — בדרך כלל JSON"],
    ["Status code", "סְטָטוּס קוֹד", "מספר בתשובה: 200 הצליח, 404 לא נמצא, 500 שגיאה בשרת"],
    ["Stateless", "סְטֵייטְלֶס", "כל בקשה עומדת בפני עצמה — השרת לא \"זוכר\" בקשות קודמות"],
    ["Idempotent", "אִידֶמְפּוֹטֶנְט", "אפשר לשלוח את אותה בקשה כמה פעמים עם אותה תוצאה (GET, PUT, DELETE)"],
    ["REST", "רֶסְט", "סגנון לתכנון API סביב משאבים וכתובות"],
    ["curl", "קֶרְל", "כלי שורת פקודה לשליחת בקשות HTTP"],
  ],
  passTest: `<ul class="check">
<li>לפרק URL מלא לחלקיו, ולתאר את מסע הבקשה מהדפדפן ועד התשובה.</li>
<li>לבחור method ו־status נכון ל־10 פעולות (יצירה, מחיקה, לא נמצא, אין הרשאה, קלט לא תקין...).</li>
<li>לשלוח עם curl בקשת POST עם JSON וכותרת, ולקרוא את התשובה המלאה עם <code>-i</code>.</li>
<li>לכתוב שרת <code>node:http</code> עם 3 routes, כולל קריאת JSON מגוף הבקשה ו־404.</li>
<li>לכתוב לקוח <code>fetch</code> עם timeout וטיפול בתשובות שאינן 2xx.</li>
<li><code>npm run check P14</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
