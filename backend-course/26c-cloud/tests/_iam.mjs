// עוזר לבדיקות של יחידה 26.3: מעריך IAM policy כמו AWS — לפי סדר ההחלטה:
// Deny מפורש מנצח ← Allow ← אחרת "implicit deny". תומך ב־* וב־? ב־Action וב־Resource,
// וב־Condition מסוג StringLike / StringEquals על s3:prefix (מה שהתרגילים צריכים).
import fs from "node:fs";
import assert from "node:assert/strict";
import { target } from "../../tools/load.mjs";

export function readPolicy(testUrl, file) {
  const text = fs.readFileSync(target(testUrl, file), "utf8");
  let p;
  try {
    p = JSON.parse(text);
  } catch (err) {
    assert.fail(`JSON לא תקין: ${err.message}`);
  }
  assert.equal(p.Version, "2012-10-17", 'Version חייב להיות "2012-10-17" (בלי זה — כללי משתנים לא עובדים)');
  assert.ok(Array.isArray(p.Statement) && p.Statement.length, "אין Statement");
  return p;
}

const arr = (x) => (x === undefined ? [] : Array.isArray(x) ? x : [x]);
const glob = (pattern, value, ci) => {
  const re = new RegExp("^" + pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$", ci ? "i" : "");
  return re.test(value);
};
function conditionOk(cond, ctx) {
  for (const [op, kv] of Object.entries(cond ?? {})) {
    for (const [key, want] of Object.entries(kv)) {
      const have = ctx[key];
      if (have === undefined) return false;
      const ok = arr(want).some((w) => (op === "StringLike" ? glob(w, have) : op === "StringEquals" ? w === have : false));
      if (!ok) return false;
    }
  }
  return true;
}

export function decide(policy, action, resource, ctx = {}) {
  let allowed = false;
  for (const s of policy.Statement) {
    const actionHit = arr(s.Action).some((a) => glob(a, action, true));
    const resHit = arr(s.Resource).some((r) => glob(r, resource));
    if (!actionHit || !resHit || !conditionOk(s.Condition, ctx)) continue;
    if (s.Effect === "Deny") return "explicit-deny";
    if (s.Effect === "Allow") allowed = true;
  }
  return allowed ? "allow" : "implicit-deny";
}

export const allows = (policy, action, resource, ctx) => decide(policy, action, resource, ctx) === "allow";
