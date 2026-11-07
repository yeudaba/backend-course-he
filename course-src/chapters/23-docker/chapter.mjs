import { copyStep } from "../../lib.mjs";

export default {
  num: 23,
  code: "23",
  title: "Linux ו־Docker",
  part: "חטיבה ד׳ — רמת תעשייה",
  checker: true,
  testTimeout: 900000, // PR2-DOCKER בונה ומריץ את כל המערכת ב־docker compose
  time: "5 מפגשים",
  expectedExercises: 25,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> Node.js 24, VS Code, ופרויקט 2 בשלב ה׳.</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<ul>
<li><a href="https://docs.docker.com/desktop/setup/install/mac-install/" target="_blank">Docker Desktop ל־Mac</a> — בחר את הגרסה למעבד שלך (Apple silicon או Intel: תפריט  ← About This Mac). אחרי ההתקנה פתח את Docker Desktop פעם אחת ואשר את ההרשאות; הלווייתן בשורת התפריטים צריך להיות יציב (לא מהבהב).</li>
<li>תוסף VS Code: <a href="https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers" target="_blank">Container Tools</a> — עזרה בכתיבת Dockerfile ו־compose, ורשימת קונטיינרים בצד.</li>
<li>(רשות) <a href="https://marketplace.visualstudio.com/items?itemName=timonwong.shellcheck" target="_blank">ShellCheck</a> — מסמן טעויות בסקריפטים של bash בזמן הכתיבה.</li>
</ul>
<p>Docker Desktop תופס זיכרון ודיסק. כשלא עובדים איתו — אפשר לסגור אותו (Quit). ו־<code>docker system df</code> מראה כמה מקום תופסים images ו־volumes.</p>
${copyStep("23-docker")}
<p><strong>✔ בדיקה:</strong> <code>docker run --rm node:24-alpine node -e "console.log(process.version, process.platform)"</code> ← <code>v24.… linux</code>. (בפעם הראשונה Docker מוריד את ה־image — זה לוקח רגע.) שים לב ל־<code>linux</code>: הקוד רץ בלינוקס, גם על ה־Mac.</p>`,
  goals: [
    "להסתדר בשרת Linux: קבצים, הרשאות, תהליכים, ports, משתני סביבה ולוגים.",
    "לכתוב סקריפטים קצרים ובטוחים ב־bash, ולעבד טקסט עם pipelines.",
    "להבין image, container, volume ו־port — ולהריץ PostgreSQL בפקודה אחת.",
    "לכתוב Dockerfile טוב: cache, .dockerignore, multi-stage, לא root, healthcheck.",
    "Docker Compose: כמה שירותים, רשת, volumes, תלויות והגדרות.",
    "פרויקט 2, שלב ו׳: כל המערכת עולה בפקודה אחת — docker compose up.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>הפרויקט שלך רץ ב־Mac. הוא צריך Node 24, PostgreSQL 18, migrations, משתני סביבה, ושני טרמינלים. מפתח חדש בצוות צריך חצי יום כדי להריץ אותו; שרת בענן — עוד חצי. Docker אורז את כל זה: האפליקציה, עם הגרסה המדויקת של Node והתלויות, הופכת ל־image אחד שרץ אותו דבר בכל מקום — ו־Compose מעלה אותה יחד עם המסד בפקודה אחת. כמעט כל משרת Backend מבקשת Docker, וכמעט כל שרת שתפגוש הוא Linux. ובפרק 25 — ה־image הזה הוא בדיוק מה שנפרס.</p>`,
  lessons: [
    { file: "lesson-01-linux.html", title: "Linux ו־shell למפתחי Backend", minutes: 50 },
    { file: "lesson-02-docker.html", title: "Docker: images, containers ו־volumes", minutes: 45 },
    { file: "lesson-03-dockerfile.html", title: "Dockerfile טוב", minutes: 50 },
    { file: "lesson-04-compose.html", title: "Docker Compose", minutes: 45 },
    { file: "lesson-05-project.html", title: "פרויקט 2, שלב ו׳: הכול בפקודה אחת", minutes: 75, note: "🤖 PR2-DOCKER" },
  ],
  glossary: [
    ["Shell / bash / zsh", "שֶׁל", "התוכנה שמפרשת את מה שמקלידים בטרמינל. ב־Mac: zsh; בשרתים ובסקריפטים: bash"],
    ["Pipe", "פַּייפּ", "| — הפלט של פקודה אחת הוא הקלט של הבאה"],
    ["stdout / stderr", "סְטַנְדַּרְט אַאוּט / אֶרוֹר", "שני ערוצי פלט: תוצאות, והודעות שגיאה"],
    ["Exit code", "אֶגְזִיט קוֹד", "המספר שתהליך מחזיר: 0 = הצלחה, כל דבר אחר = כישלון"],
    ["Permissions", "פֶּרְמִישֶׁנְס", "rwx לבעלים, לקבוצה ולאחרים (chmod 644, 755, 600)"],
    ["Process / PID", "פְּרוֹסֶס", "תוכנה שרצה, ומספר הזיהוי שלה"],
    ["Signal (SIGTERM)", "סִיגְנַל", "הודעה לתהליך: SIGTERM — \"תסגור יפה\"; SIGKILL — מיד, בלי לשאול"],
    ["Image", "אִימָג'", "תבנית קבועה: מערכת קבצים + הגדרות. נבנה מ־Dockerfile"],
    ["Container", "קוֹנְטֵיינֶר", "מופע רץ של image, מבודד מהמחשב"],
    ["Layer", "לֵייֶר", "שכבה ב־image — כל הוראה ב־Dockerfile; נשמרת ב־cache"],
    ["Volume", "ווֹלְיוּם", "אחסון ששורד מחיקה של קונטיינר — שם גרים הנתונים"],
    ["Bind mount", "בַּיינְד מַאוּנְט", "תיקייה מהמחשב שמחוברת לתוך קונטיינר"],
    ["Registry", "רֶגִ'יסְטְרִי", "שרת שמאחסן images (Docker Hub, GHCR)"],
    ["Multi-stage build", "מוּלְטִי־סְטֵייג'", "Dockerfile עם כמה FROM: בונים באחד, מעתיקים רק את התוצאה לאחרון"],
    ["Docker Compose", "קוֹמְפּוֹז", "קובץ YAML שמתאר כמה שירותים יחד, ומעלה אותם בפקודה אחת"],
    ["Healthcheck", "הֶלְתְ'צֶ'ק", "בדיקה תקופתית שאומרת אם השירות באמת מוכן"],
  ],
  passTest: `<ul class="check">
<li>למצוא בשרת: מה תופס את ה־port, מה כתוב בלוג, מה ממלא את הדיסק.</li>
<li>לכתוב סקריפט bash עם <code>set -euo pipefail</code>, מרכאות, ו־exit codes נכונים.</li>
<li>להסביר image / container / volume, ולמה <code>down -v</code> מוחק את המסד.</li>
<li>לכתוב Dockerfile: סדר שמנצל cache, multi-stage, לא root, בלי סודות.</li>
<li>compose עם מסד: שם שירות כ־host, healthcheck + condition, volume.</li>
<li>פרויקט 2: PR2-DOCKER עובר.</li>
<li><code>npm run check P23</code>: 80% מ־E06–E19, ולפחות שני תרגילי תיקון.</li>
</ul>`,
};
