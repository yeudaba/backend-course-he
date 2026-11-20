import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { target } from "../../tools/load.mjs";

// מפרק שורה כמו ה־shell: מירכאות בודדות וכפולות, \ לפני תו, ו־& / ; / | כמפרידים
function shellWords(line) {
  const words = [];
  let cur = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'") {
      const end = line.indexOf("'", i + 1);
      if (end === -1) return { error: "מירכאות בודדות לא נסגרו" };
      cur = (cur ?? "") + line.slice(i + 1, end);
      i = end;
    } else if (ch === '"') {
      let s = "";
      let j = i + 1;
      for (; j < line.length && line[j] !== '"'; j++) {
        if (line[j] === "\\" && j + 1 < line.length) s += line[++j];
        else s += line[j];
      }
      if (j >= line.length) return { error: "מירכאות כפולות לא נסגרו" };
      cur = (cur ?? "") + s;
      i = j;
    } else if (ch === "\\" && i + 1 < line.length) {
      cur = (cur ?? "") + line[++i];
    } else if (/\s/.test(ch)) {
      if (cur !== null) words.push(cur), (cur = null);
    } else if ("&;|".includes(ch)) {
      if (cur !== null) words.push(cur), (cur = null);
      words.push({ op: ch });
    } else cur = (cur ?? "") + ch;
  }
  if (cur !== null) words.push(cur);
  return { words };
}

function request(words) {
  const req = { method: "GET", headers: {}, url: null, data: null };
  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    if (w === "-X") req.method = words[++i];
    else if (w === "-H") {
      const [k, ...v] = words[++i].split(":");
      req.headers[k.trim().toLowerCase()] = v.join(":").trim();
    } else if (w === "-d" || w === "--data") req.data = words[++i];
    else if (!req.url) req.url = w;
  }
  return req;
}

const commands = () =>
  readFileSync(target(import.meta.url, "P14-E84.sh"), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

function parsed(n) {
  const lines = commands();
  assert.equal(lines.length, 3, "צריכות להיות בדיוק שלוש פקודות curl");
  const r = shellWords(lines[n]);
  assert.ok(!r.error, `פקודה ${n + 1}: ${r.error}`);
  const ops = r.words.filter((w) => typeof w === "object");
  assert.deepEqual(ops, [], `פקודה ${n + 1}: ה־shell רואה כאן "${ops[0]?.op}" כפקודה נפרדת — חלק מהכתובת לא מגיע ל־curl`);
  assert.equal(r.words[0], "curl");
  return request(r.words);
}

test("1. החיפוש שולח את שני הפרמטרים", () => {
  const req = parsed(0);
  assert.equal(req.method, "GET");
  const url = new URL(req.url);
  assert.equal(url.pathname, "/products");
  assert.equal(url.searchParams.get("category"), "coffee");
  assert.equal(url.searchParams.get("maxPrice"), "50", "maxPrice=50 לא מגיע ל־curl");
});
test("2. POST עם JSON ש־express.json() יקרא", () => {
  const req = parsed(1);
  assert.equal(req.method, "POST");
  assert.equal(new URL(req.url).pathname, "/products");
  assert.match(req.headers["content-type"] ?? "", /^application\/json/, "בלי Content-Type: application/json השרת לא יודע שהגוף הוא JSON");
  assert.deepEqual(JSON.parse(req.data), { name: "Latte", price: 14 });
});
test("3. PATCH עם גוף JSON תקין", () => {
  const req = parsed(2);
  assert.equal(req.method, "PATCH");
  assert.equal(new URL(req.url).pathname, "/products/7");
  assert.match(req.headers["content-type"] ?? "", /^application\/json/);
  let body;
  assert.doesNotThrow(() => (body = JSON.parse(req.data)), `הגוף ש־curl מקבל אחרי ה־shell הוא ${req.data} — זה לא JSON`);
  assert.deepEqual(body, { price: 12 });
});
