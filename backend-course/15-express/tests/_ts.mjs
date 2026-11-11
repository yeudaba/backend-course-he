// עוזר לבדיקות של תרגולי הכתיבה (E26–E28) בפרקי TypeScript: טוען את הקובץ שלך, בודק שייצאת את מה שהמשימה ביקשה,
// ובודק את הטיפוסים שלך עם קובץ "בוחן" קטן: שורות שחייבות לעבור, ושורות עם @ts-expect-error שחייבות להיכשל.
// לא צריך להבין את הקובץ הזה עכשיו — נלמד על בדיקות בפרק 22.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { load, target } from "../../tools/load.mjs";

// מחרוזות (קבוצה 1) או הערות (// ו־/* */)
const TOKENS = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

function filePath(testUrl, file) {
  const p = target(testUrl, file);
  if (!fs.existsSync(p)) throw new Error(`לא מצאתי את הקובץ ${file} בתיקיית starter. האם הוא נמחק או שונה שמו?`);
  return p;
}

// הקוד שלך בלי הערות
export function code(testUrl, file) {
  return fs.readFileSync(filePath(testUrl, file), "utf8").replace(TOKENS, (all, str) => str ?? "");
}

// טוען את הקובץ ומוודא שכל השמות יוצאו עם export
export async function exportsOf(testUrl, file, names) {
  const mod = await load(testUrl, file);
  for (const name of names) {
    if (mod[name] === undefined) assert.fail(`הקובץ ${file} לא מייצא את ${name}. כתוב export לפני ההגדרה: ${/^[A-Z]/.test(name) ? `export class ${name}` : (/Schema$/.test(name) ? `export const ${name} = z.object(...)` : `export function ${name}(...)`)}`);
  }
  return mod;
}

function tsc(files) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const bin = process.env.TSC_PATH || path.join(root, "node_modules", "typescript", "bin", "tsc");
  if (!fs.existsSync(bin)) return { ok: false, output: "TypeScript לא מותקן. הרץ npm install בתיקיית הקורס (פרק 11, קופסת 🧰)." };
  const args = [bin, "--noEmit", "--strict", "--target", "es2022", "--module", "nodenext", "--allowImportingTsExtensions", "--skipLibCheck", "--pretty", "false", ...files];
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  return { ok: r.status === 0, output: (r.stdout + r.stderr).trim() };
}

// tsc --strict על הקובץ שלך בלבד
export function typecheck(testUrl, file) {
  const p = filePath(testUrl, file);
  const r = tsc([p]);
  return { ok: r.ok, output: r.output.replaceAll(path.dirname(p) + path.sep, "") };
}

// בוחן טיפוסים: probe הוא קוד TypeScript. המחרוזת FILE בתוכו מוחלפת בנתיב לקובץ שלך.
// מחזיר { ok, message } — ב־message: השורות בבוחן שנכשלו, עם ההערה שמעליהן
export function typeProbe(testUrl, file, probe) {
  const p = filePath(testUrl, file);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "probe-"));
  const probeFile = path.join(dir, "probe.ts");
  const text = probe.replaceAll("FILE", p.split(path.sep).join("/"));
  fs.writeFileSync(probeFile, text);
  try {
    const r = tsc([probeFile]);
    if (r.ok) return { ok: true, message: "" };
    const lines = text.split("\n");
    const problems = [];
    for (const m of r.output.matchAll(/^(.*?)\((\d+),\d+\): error (TS\d+): (.*)$/gm)) {
      const [, where, lineNo, tsCode, msg] = m;
      if (!where.endsWith("probe.ts")) {
        problems.push(`בקובץ שלך: ${path.basename(where)}(${lineNo}): ${msg}`);
        continue;
      }
      const i = Number(lineNo) - 1;
      const note = lines[i - 1]?.trim().startsWith("//") ? lines[i - 1].trim().replace(/^\/\/\s*(@ts-expect-error\s*)?—?\s*/, "") : "";
      if (tsCode === "TS2578") {
        const why = lines[i].replace(/^\s*\/\/\s*@ts-expect-error\s*—?\s*/, "");
        problems.push(`ציפינו לשגיאת טיפוס, ו־TypeScript קיבל את השורה: ${lines[i + 1]?.trim()}  ←  ${why}`);
      } else {
        problems.push(`השורה צריכה לעבור, אבל נכשלה: ${lines[i].trim()}  ←  ${note ? note + ". " : ""}${msg}`);
      }
    }
    // הבודק מציג שורה אחת מההודעה — לכן הבעיה הראשונה, ואחריה כמה נוספות יש
    const more = problems.length > 1 ? ` (ועוד ${problems.length - 1} בעיות טיפוסים)` : "";
    const message = (problems.length ? problems[0] + more : r.output).replaceAll(p.split(path.sep).join("/"), path.basename(p));
    return { ok: false, message };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
