// מדווח פשוט וקריא לבודק של הקורס: ✔ / ✖ ומה קיבלנו מול מה ציפינו.
import fs from "node:fs";
import path from "node:path";
import { inspect } from "node:util";

const show = (v) => inspect(v, { depth: 3, breakLength: Infinity });

// הקובץ של הלומד והשורה, מתוך פלט השגיאה (stack) — בלי קבצים של Node, של הבודק או של ספריות
const LOC = /(?:file:\/\/)?(\/[^\s():'"]+\.[cm]?[jt]s):(\d+)/g;
function learnerLocation(lines) {
  for (const line of lines) {
    for (const m of line.matchAll(LOC)) {
      if (!/\/(tests|tools|node_modules)\//.test(m[1])) return { file: m[1], line: +m[2] };
    }
  }
  return null;
}

export default async function* reporter(source) {
  let pass = 0;
  let fail = 0;
  let loadFail = 0;
  const stderr = new Map(); // קובץ בדיקה ← שורות שגיאה שהודפסו
  for await (const event of source) {
    if (event.type === "test:pass" && event.data.details?.type !== "suite") {
      pass++;
      yield `  ✔ ${event.data.name}\n`;
    } else if (event.type === "test:fail" && event.data.details?.type !== "suite") {
      fail++;
      const err = event.data.details?.error;
      const cause = err?.cause ?? err;
      // קובץ שנפל בטעינה מדווח בשם הנתיב המלא — מספיק שם הקובץ
      yield `  ✖ ${path.isAbsolute(event.data.name) ? path.basename(event.data.name) : event.data.name}\n`;
      // הודעה שכתבנו בבדיקה (assert.ok(x, "...")) — מסבירה מה חסר טוב יותר מ־"קיבלנו false"
      let custom = cause && typeof cause === "object" && cause.generatedMessage === false && cause.message;
      // assert.throws / rejects שלא נזרקה בהם שגיאה: Node כותב "Missing expected exception" באנגלית, בלי קיבלנו/ציפינו
      const missing = custom && /^Missing expected (exception|rejection)\.?:? ?/.exec(String(custom));
      if (missing) {
        const extra = String(custom).slice(missing[0].length);
        custom = `ציפינו ש${missing[1] === "exception" ? "תיזרק שגיאה" : "ה־Promise יידחה (reject)"} — אבל זה לא קרה${extra ? `: ${extra}` : ""}`;
      }
      if (custom) yield `      ${String(custom).split("\n")[0]}\n`;
      if (missing || (custom && ["==", "fail", "match", "doesNotMatch"].includes(cause.operator))) {
        // assert.ok / fail / match — ההודעה מספיקה (בלי להדפיס את כל הקוד שלך כ"קיבלנו")
      } else if (cause && typeof cause === "object" && "expected" in cause && "actual" in cause) {
        yield `      קיבלנו: ${show(cause.actual)}\n      ציפינו: ${show(cause.expected)}\n`;
      } else if (cause && typeof cause === "object" && cause.message) {
        yield `      שגיאה: ${String(cause.message).split("\n")[0]}\n`;
      } else {
        // קובץ הבדיקה נפל עוד לפני שהבדיקות רצו: הקובץ שלך לא נטען (שגיאת תחביר, require/import שגוי, קריסה בטעינה)
        loadFail++;
        const testFile = path.resolve(event.data.file ?? "");
        const loc = learnerLocation(stderr.get(testFile) ?? []);
        if (loc) {
          const chapterDir = path.dirname(path.dirname(testFile));
          const rel = chapterDir ? path.relative(chapterDir, loc.file) : loc.file;
          const shown = rel.startsWith("..") ? loc.file : rel; // פרויקט בתיקייה משלו (--dir) — הנתיב המלא
          yield `      הקובץ שלך לא נטען: השגיאה (למעלה, ⚠️) קרתה ב־${shown}, שורה ${loc.line}\n`;
          yield `      מה לבדוק: את השורה הזו (שגיאת כתיבה? שם קובץ ב־require/import? משתנה שעוד לא הוגדר?).\n`;
          yield `      כדי לראות את השגיאה המלאה, הרץ: node ${loc.file}\n`;
        } else {
          yield `      הקובץ שלך לא נטען — השגיאה מוצגת למעלה (⚠️). תקן אותה והרץ שוב.\n`;
        }
      }
    } else if (event.type === "test:stderr") {
      const key = path.resolve(event.data.file ?? "");
      if (!stderr.has(key)) stderr.set(key, []);
      stderr.get(key).push(String(event.data.message));
      const line = String(event.data.message).trim();
      if (/^\w*Error\b/.test(line)) yield `      ⚠️ ${line}\n`;
    } else if (event.type === "test:stdout") {
      yield `      (פלט מהקוד שלך) ${event.data.message}`;
    }
  }
  yield `\n${pass} עברו, ${fail} נכשלו\n`;
  // check.mjs מסכם בשורה האחרונה; כשהקובץ לא נטען אין "ציפינו/קיבלנו" — מסמנים לו דרך קובץ
  if (loadFail && process.env.CHECK_STATUS_FILE) {
    try { fs.writeFileSync(process.env.CHECK_STATUS_FILE, "load-fail"); } catch { /* לא קריטי */ }
  }
}
