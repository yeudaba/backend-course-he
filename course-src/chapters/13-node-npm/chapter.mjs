import { copyStep, verifyNode } from "../../lib.mjs";

export default {
  num: 13,
  code: "13",
  title: "Node.js ו־npm",
  part: "חטיבה ב׳ — TypeScript ו־Node.js",
  checker: true,
  time: "3–4 מפגשים",
  expectedExercises: 80,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24+ (npm מגיע איתו), VS Code, הבודק.</p>
<p><strong>מה מתקינים עכשיו:</strong> שום תוכנה. בפרק הזה תתקין <em>ספריות</em> לתוך פרויקטים עם <code>npm install</code> — וסוף־סוף תבין מה קרה כשהרצת את זה בפרקים 8 ו־11.</p>
<p><strong>רשות — nvm (מנהל גרסאות Node):</strong> בעבודה תפגוש פרויקטים שדורשים גרסאות Node שונות. <a href="https://github.com/nvm-sh/nvm#installing-and-updating" target="_blank">nvm</a> מאפשר להחזיק כמה גרסאות. לא חובה בקורס — אם תתקין, עקוב אחרי ההוראות הרשמיות בלבד.</p>
${copyStep("13-node-npm")}
${verifyNode}
<p>בדיקה נוספת: <code>npm -v</code> מציג גרסה 10 ומעלה.</p>`,
  goals: [
    "להבין מה זה package, `package.json`, `node_modules` ו־`package-lock.json` — ומה נכנס ל־Git.",
    "להתקין ספריות (dependencies / devDependencies), להבין גרסאות (semver), ולהריץ scripts.",
    "לעבוד עם `process`: ארגומנטים, משתני סביבה, קוד יציאה, אותות.",
    "לנהל הגדרות וסודות עם `.env` ו־`--env-file`.",
    "להשתמש במודולים המובנים: `fs/promises`, `path`, `crypto`, `readline`.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>אף שרת לא נכתב מאפס: Express, Prisma, Zod, ספריית תאריכים — כולן חבילות npm. פרויקט Backend טיפוסי תלוי במאות חבילות (ישירות ועקיפות). להבין איך הן מותקנות, איך גרסאות עובדות, ואיך שומרים סודות מחוץ לקוד — זה בסיס לכל פרויקט מכאן והלאה, וחלק מהשאלות הראשונות בראיון.</p>`,
  lessons: [
    { file: "lesson-01-npm.html", title: "npm ו־package.json", minutes: 40 },
    { file: "lesson-02-process.html", title: "process: ארגומנטים, סביבה וקוד יציאה", minutes: 30 },
    { file: "lesson-03-config.html", title: "הגדרות וסודות: .env", minutes: 30 },
    { file: "lesson-04-builtins.html", title: "המודולים המובנים: fs, path, crypto, readline", minutes: 35 },
  ],
  glossary: [
    ["Package", "פֶּקֶג'", "חבילה — קוד שמישהו פרסם לשימוש חוזר"],
    ["npm", "אֶן־פִּי־אֶם", "מנהל החבילות של Node + המאגר הציבורי של חבילות"],
    ["package.json", "פֶּקֶג' ג'ֵייסוֹן", "תעודת הזהות של פרויקט: שם, scripts ותלויות"],
    ["Dependency", "דִיפֶּנְדֶנְסִי", "תלות — חבילה שהפרויקט צריך כדי לרוץ"],
    ["devDependency", "דֶב", "תלות שנדרשת רק בפיתוח (בדיקות, TypeScript, ESLint)"],
    ["node_modules", "נוֹד מוֹדְיוּלְז", "התיקייה שבה מותקנות החבילות. לא נכנסת ל־Git"],
    ["Lockfile", "לוֹק־פַייל", "`package-lock.json` — הגרסאות המדויקות שהותקנו"],
    ["Semver", "סֶמְוֶר", "גרסה בפורמט MAJOR.MINOR.PATCH"],
    ["npx", "אֶן־פִּי־אֶקְס", "מריץ כלי מתוך החבילות של הפרויקט"],
    ["Script", "סְקְרִיפְּט", "פקודה בשם ב־package.json, מריצים עם `npm run`"],
    ["Environment variable", "אֶנְוַויְרוֹנְמֶנְט", "משתנה סביבה — הגדרה שמגיעה מחוץ לקוד (`process.env`)"],
    [".env", "דוֹט אֶנְב", "קובץ משתני סביבה מקומי. לא נכנס ל־Git"],
    ["Exit code", "אֶגְזִיט קוֹד", "0 = הצלחה, אחר = כישלון"],
    ["Stream", "סְטְרִים", "קריאה/כתיבה בחלקים, בלי לטעון הכול לזיכרון"],
  ],
  passTest: `<ul class="check">
<li>ליצור פרויקט חדש עם <code>npm init</code>, להתקין חבילה אחת כ־dependency ואחת כ־devDependency, ולהסביר כל שדה שנוסף.</li>
<li>להסביר מה אומרות הגרסאות <code>^4.18.2</code> ו־<code>~4.18.2</code>, ומה תפקיד ה־lockfile.</li>
<li>לכתוב מודול config שקורא מ־<code>process.env</code>, נכשל מוקדם על הגדרה חסרה, ועובד עם <code>node --env-file=.env</code>.</li>
<li>לקרוא קובץ גדול שורה־שורה בלי לטעון אותו לזיכרון.</li>
<li><code>npm run check P13</code>: 80% מ־E06–E19, ולפחות תרגיל תיקון אחד.</li>
</ul>`,
};
