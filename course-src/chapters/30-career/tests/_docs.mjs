// עוזרים לבדיקות של מסמכים (פרק 30): README, קורות חיים, LinkedIn, pitch.
// הבודק לא שופט סגנון — הוא תופס את מה שמראיינים ומגייסים רואים מיד: placeholders, אורך, קישורים חסרים, מבנה
import fs from "node:fs";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";

export function readDoc(testUrl, file) {
  const path = target(testUrl, file);
  assert.ok(fs.existsSync(path), `לא נמצא הקובץ ${file}`);
  return fs.readFileSync(path, "utf8");
}

// מילים — בלי קוד, קישורים בסוגריים, ו־markdown
export function words(md) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#*_>`|\-[\]]/g, " ");
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.+#-]*/gu) ?? [];
}

export const PLACEHOLDER = /\b(TODO|TBD|lorem|ipsum|YOUR[-_ ]?(NAME|USER|LINK|EMAIL)|example\.com|xxx+)\b|<[^>\n]*(שם|כאן|your|here)[^>\n]*>|\[(כאן|שם|here|your)[^\]]*\]/i;

export function assertNoPlaceholders(md, what) {
  const m = PLACEHOLDER.exec(md);
  assert.ok(!m, `${what}: נשאר placeholder — "${m?.[0]}". החלף בתוכן אמיתי שלך`);
}

export const headings = (md, level = 2) => [...md.matchAll(new RegExp(`^${"#".repeat(level)}\\s+(.+)$`, "gm"))].map((m) => m[1].trim());

export function section(md, title) {
  const re = new RegExp(`^##\\s+${title}\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "mi");
  return re.exec(md)?.[1] ?? null;
}

export const links = (md) => [...md.matchAll(/https?:\/\/[^\s)>\]]+/g)].map((m) => m[0]);
