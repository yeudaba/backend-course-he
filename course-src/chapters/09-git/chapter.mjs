import { copyStep } from "../../lib.mjs";

export default {
  num: 9,
  code: "09",
  title: "Git ו־GitHub",
  part: "חטיבה א׳ — יסודות JavaScript",
  time: "4 מפגשים",
  expectedExercises: 28,
  install: `<p><strong>מה צריך שכבר יהיה מותקן:</strong> VS Code, Node.js.</p>
<p><strong>מה מתקינים עכשיו:</strong></p>
<div class="table-wrap"><table>
<tr><th>כלי</th><th>איך</th><th>בדיקה</th></tr>
<tr><td><strong>Git</strong></td><td>ב־Terminal: <code>xcode-select --install</code> ← בחלון שנפתח לחץ <strong>Install</strong> (כמה דקות). אם כתוב שהכלים כבר מותקנים — מעולה, דלג. (<a href="https://git-scm.com/downloads/mac" target="_blank">אפשרויות נוספות</a>)</td><td><code>git --version</code></td></tr>
<tr><td><strong>חשבון GitHub</strong></td><td><a href="https://github.com/signup" target="_blank">github.com/signup</a> — חינם. בחר שם משתמש מקצועי (הוא יופיע בקורות החיים): למשל <code>yehuda-cohen</code>, לא <code>coolguy1999</code>. הפעל אימות דו־שלבי (2FA) — GitHub דורש את זה.</td><td>התחברות באתר</td></tr>
<tr><td>התחברות מ־VS Code</td><td>אייקון האדם בפינה השמאלית התחתונה של VS Code ← <strong>Sign in with GitHub</strong> ← אשר בדפדפן. כך פקודות <code>git push</code> מה־Terminal של VS Code יעבדו בלי סיסמאות.</td><td>שם המשתמש מופיע בתפריט</td></tr>
<tr><td>תוסף GitLens</td><td><a href="https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens" target="_blank">GitLens</a> (מזהה <code>eamodio.gitlens</code>) — מראה ליד כל שורה מי שינה אותה ומתי. (יש בו גם תכונות בתשלום — לא צריך אותן.)</td><td>—</td></tr>
</table></div>
<p><strong>הגדרה חד־פעמית</strong> — הזהות שתופיע על כל ה־commits שלך (השתמש באימייל של חשבון GitHub):</p>
<pre class="terminal"><span class="prompt">% </span>git config --global user.name "Yehuda Cohen"
<span class="prompt">% </span>git config --global user.email "your-email@example.com"
<span class="prompt">% </span>git config --global init.defaultBranch main
<span class="prompt">% </span>git config --global core.editor "code --wait"</pre>
<p>(השורה האחרונה: כש־Git צריך שתכתוב טקסט ארוך, הוא יפתח את VS Code.)</p>
<p><strong>בודק אוטומטי:</strong> רוב התרגילים בפרק נעשים ב־Terminal, ובודקים אותם בעיניים (<code>git log</code>, ‏<code>git status</code>). לשלושת תרגולי הכתיבה שבראש דף התרגילים (E26–E28) יש בודק, כמו בפרקים 1–8: <code>npm run check P09-E26</code>. ב־E26 הבודק מריץ את סקריפט ה־Git שלך בתיקייה זמנית ריקה, עם שם ואימייל של בדיקה — ההגדרות שלך לא משתנות.</p>
${copyStep("09-git")}
<p><strong>✔ בדיקה:</strong> <code>git --version</code> מציג גרסה 2.x, ו־<code>git config --global user.name</code> מציג את השם שלך.</p>`,
  goals: [
    "להבין מה Git שומר, ואת שלושת האזורים: תיקיית עבודה, staging ו־repository.",
    "לעבוד במחזור יומי: `status` ← `add` ← `commit` ← `log`, עם הודעות commit טובות.",
    "לראות שינויים (`diff`), לבטל שינויים, ולהתעלם מקבצים (`.gitignore`).",
    "לעבוד עם branches, למזג, ולפתור התנגשות.",
    "להעלות פרויקט ל־GitHub, לעבוד עם Pull Request, ולשמור סודות מחוץ לקוד.",
  ],
  intro: `<h2>🤔 למה צריך את זה?</h2>
<p>אין חברה בעולם שבה מפתחים לא עובדים עם Git. זו מכונת זמן לקוד: כל גרסה שמורה, אפשר לחזור אחורה, לראות מי שינה מה ולמה, ולעבוד כמה אנשים על אותו קוד בלי לדרוס זה את זה. ו־GitHub הוא גם <strong>תיק העבודות שלך</strong>: מראיינים פותחים את הפרופיל שלך עוד לפני הראיון.</p>`,
  lessons: [
    { file: "lesson-01-basics.html", title: "commit ראשון: שלושת האזורים", minutes: 40 },
    { file: "lesson-02-diff-undo.html", title: "diff, ביטול שינויים ו־.gitignore", minutes: 35 },
    { file: "lesson-03-branches.html", title: "branches, merge והתנגשויות", minutes: 40 },
    { file: "lesson-04-github.html", title: "GitHub: push, Pull Request וסודות", minutes: 40 },
  ],
  glossary: [
    ["Version control", "וֶרְשֶׁן קוֹנְטְרוֹל", "ניהול גרסאות — שמירת היסטוריה של כל שינוי"],
    ["Repository (repo)", "רִיפּוֹזִיטוֹרִי", "מאגר — תיקיית פרויקט ש־Git עוקב אחריה"],
    ["Commit", "קוֹמִיט", "\"תמונת מצב\" שמורה של הפרויקט, עם הודעה"],
    ["Staging area", "סְטֵייגִ'ינְג", "אזור ההכנה — מה שייכנס ל־commit הבא"],
    ["Working directory", "וֶורְקִינְג", "הקבצים כפי שהם עכשיו בתיקייה"],
    ["Diff", "דִיף", "ההבדלים בין שתי גרסאות"],
    ["Branch", "בְּרַאנְץ'", "ענף — קו פיתוח נפרד"],
    ["Merge", "מֶרְג'", "מיזוג — איחוד שינויים מענף אחד לאחר"],
    ["Conflict", "קוֹנְפְלִיקְט", "התנגשות — שני ענפים שינו את אותה שורה"],
    ["Remote", "רִימוֹט", "עותק של המאגר בשרת (GitHub)"],
    ["push / pull", "פּוּש / פּוּל", "שליחה לשרת / משיכה מהשרת"],
    ["Clone", "קְלוֹן", "הורדה של מאגר שלם מהשרת"],
    ["Pull Request (PR)", "פּוּל רִיקְוֶוסְט", "בקשה למזג ענף, עם סקירת קוד"],
    ["HEAD", "הֶד", "\"אתה נמצא כאן\" — ה־commit הנוכחי"],
    [".gitignore", "גִיט־אִיגְנוֹר", "רשימת קבצים ש־Git לא יעקוב אחריהם"],
  ],
  passTest: `<ul class="check">
<li>ליצור מאגר לפרויקט 1, עם <code>.gitignore</code> נכון ולפחות 3 commits עם הודעות ברורות — ולהעלות ל־GitHub עם README.</li>
<li>להסביר את שלושת האזורים ומה כל אחת מהפקודות <code>add</code>, <code>commit</code>, <code>restore</code> מזיזה ביניהם.</li>
<li>ליצור ענף, לעבוד עליו, לפתוח Pull Request ולמזג.</li>
<li>לפתור התנגשות בתרגיל <code>conflict</code> בלי לאבד אף אחד מהשינויים.</li>
<li>לדעת מה לעשות אם סוד נדחף ל־GitHub (ולמה מחיקה מה־commit הבא לא מספיקה).</li>
<li>לענות נכון על 80% מ־P09-E01–E19 ולפתור לפחות תרחיש תקלה אחד (E20–E23).</li>
</ul>`,
};
