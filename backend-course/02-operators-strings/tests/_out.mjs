// עוזר לבדיקות של פרקים 1–4: מריץ את הקובץ שלך ובודק מה הוא הדפיס.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { target } from "../../tools/load.mjs";

// התוכן של הקובץ שלך
export function source(testUrl, file) {
  const p = target(testUrl, file);
  if (!fs.existsSync(p)) throw new Error(`לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?`);
  return fs.readFileSync(p, "utf8");
}

// מחרוזות (קבוצה 1) או הערות (// ו־/* */)
const TOKENS = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

// הקוד בלי הערות — כדי שהבדיקות לא יספרו מילים שכתבת בהערה
export function code(src) {
  return src.replace(TOKENS, (all, str) => str ?? "");
}

// איפה בקובץ יש הערות (כדי שהחלפת ערך לא תיגע בהערה שבראש הקובץ)
function commentRanges(src) {
  return [...src.matchAll(TOKENS)].filter((m) => m[1] === undefined).map((m) => [m.index, m.index + m[0].length]);
}

// הקוד שלך בלי הערות ובלי טקסט: "..." ו־'...' הופכים ל־"", ומ־`...` נשארים רק החלקים של ${...}
// (גם כשיש template literal בתוך ${...}, למשל `ORD-${`${n}`.padStart(5, "0")}`)
export function bareCode(src) {
  let i = 0;
  const out = [];
  // קוד רגיל, עד הסוף או עד } שסוגר את ${ (כש־inExpr)
  const codeUntil = (inExpr) => {
    let depth = 0;
    let s = "";
    while (i < src.length) {
      const c = src[i];
      const two = src.slice(i, i + 2);
      if (two === "//") { while (i < src.length && src[i] !== "\n") i++; continue; }
      if (two === "/*") { const end = src.indexOf("*/", i + 2); i = end === -1 ? src.length : end + 2; s += " "; continue; }
      if (c === '"' || c === "'") {
        i++;
        while (i < src.length && src[i] !== c && src[i] !== "\n") i += src[i] === "\\" ? 2 : 1;
        if (src[i] === c) i++; // מחרוזת שלא נסגרה — נעצרים בסוף השורה
        s += '""';
        continue;
      }
      if (c === "`") { i++; s += template(); continue; }
      if (c === "{") depth++;
      if (c === "}") { if (inExpr && depth === 0) { i++; return s; } depth--; }
      s += c;
      i++;
    }
    return s;
  };
  // בתוך `...`: מחזיר רק את הביטויים ${...}, מופרדים ברווח
  const template = () => {
    const parts = [];
    while (i < src.length) {
      if (src[i] === "\\") { i += 2; continue; }
      if (src[i] === "`") { i++; break; }
      if (src.startsWith("${", i)) { i += 2; parts.push("${" + codeUntil(true) + "}"); continue; }
      i++;
    }
    return parts.join(" ");
  };
  out.push(codeUntil(false));
  return out.join("");
}

// כל המחרוזות שכתבת בקוד (בתוך "...", '...' או `...`, בלי הביטויים שבתוך ${...})
export function strings(src) {
  return [...code(src).matchAll(/"((?:\\.|[^"\\\n])*)"|'((?:\\.|[^'\\\n])*)'|`((?:\\.|[^`\\])*)`/g)].map((m) => m[1] ?? m[2] ?? m[3].replace(/\$\{[^}]*\}/g, "")); // בתוך `...` — בלי החלקים של ${...}
}

// מריץ את הקובץ שלך. עם changes: מריץ עותק שבו ערך אחד הוחלף (למשל מחיר אחר),
// כדי לוודא שהקוד מחשב — ולא מדפיס תוצאה שחושבה בראש.
// changes: [[ביטוי לחיפוש, מה לשים במקום, הסבר למקרה שלא נמצא], ...]
export function run(testUrl, file, { changes = [], input = "" } = {}) {
  let src = source(testUrl, file);
  for (const [find, replace, what] of changes) {
    const re = find instanceof RegExp ? find : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const comments = commentRanges(src);
    const m = [...src.matchAll(new RegExp(re.source, re.flags.replace("g", "") + "g"))].find((x) => !comments.some(([a, b]) => x.index >= a && x.index < b));
    if (!m) throw new Error(`הבודק מחפש בקוד שלך ${what ?? find} כדי להריץ אותו עם ערך אחר — ולא מצא. בדוק שכתבת אותו בדיוק כמו בתרגיל.`);
    src = src.slice(0, m.index) + m[0].replace(re, replace) + src.slice(m.index + m[0].length);
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "check-"));
  const f = path.join(dir, path.basename(file));
  fs.writeFileSync(f, src);
  try {
    const r = spawnSync(process.execPath, [f], { encoding: "utf8", input, timeout: 10000 });
    return { lines: r.stdout.replace(/\s+$/, "").split("\n").map((l) => l.replace(/\s+$/, "")), stdout: r.stdout, stderr: r.stderr, status: r.status, signal: r.signal };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// הקובץ רץ בלי שגיאה
export function ranOk(r) {
  if (r.signal) assert.fail("הקובץ שלך רץ יותר מ־10 שניות ונעצר — אולי לולאה אינסופית? (בדוק שהתנאי של הלולאה נהיה false מתישהו)");
  if (r.status !== 0) {
    const err = r.stderr.split("\n").find((l) => /^\w*Error\b/.test(l)) ?? r.stderr.trim().split("\n")[0] ?? "";
    assert.fail(`הקובץ שלך נעצר עם שגיאה: ${err}`);
  }
}

// הקובץ רץ בלי שגיאה והדפיס משהו
export function printed(r) {
  ranOk(r);
  if (r.stdout.trim() === "") assert.fail("הקובץ לא הדפיס כלום. עוד לא כתבת קוד? (או ששכחת console.log)");
}

// הפלט זהה לפלט הרצוי, שורה אחר שורה
export function sameOutput(r, expected) {
  printed(r);
  assert.deepEqual(r.lines, expected, "הפלט שונה ממה שציפינו (שורה אחר שורה)");
}
