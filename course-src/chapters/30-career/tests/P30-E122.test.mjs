import { test } from "node:test";
import assert from "node:assert/strict";
import { readDoc, words } from "./_docs.mjs";

function parts(md) {
  const out = [];
  for (const line of md.split("\n")) {
    const m = /^\s*(s|t|a|r|situation|task|action|result):\s*(.*)$/i.exec(line);
    if (m) out.push({ key: m[1][0].toUpperCase(), text: m[2] });
    else if (out.length) out.at(-1).text += " " + line;
  }
  return out;
}
const story = () => parts(readDoc(import.meta.url, "P30-E122-story.md"));

test("ארבעת החלקים, בסדר", () => {
  assert.deepEqual(story().map((p) => p.key), ["S", "T", "A", "R"], "צריך S, T, A, R — כל אחד פעם אחת, בסדר הזה");
});
test("A לפחות 40% מהמילים", () => {
  const p = story();
  const total = p.reduce((s, x) => s + words(x.text).length, 0);
  const a = words(p.find((x) => x.key === "A")?.text ?? "").length;
  assert.ok(total > 0 && a / total >= 0.4, `A הוא ${Math.round((100 * a) / (total || 1))}% מהמילים — צריך לפחות 40%`);
});
test("ב־A: 'I' לפחות כמו 'we'", () => {
  const a = (story().find((x) => x.key === "A")?.text ?? "").toLowerCase();
  const count = (w) => (a.match(new RegExp(`\\b${w}\\b`, "g")) ?? []).length;
  assert.ok(count("i") >= 1 && count("i") >= count("we"), `ב־A יש ${count("we")} "we" ו־${count("i")} "I" — מה אתה עשית?`);
});
test("R עם מספר", () => {
  const r = story().find((x) => x.key === "R");
  assert.ok(r && words(r.text).length >= 5, "חסרה תוצאה (R)");
  assert.match(r.text, /\d/, "בתוצאה צריך מספר");
});
