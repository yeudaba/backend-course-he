import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { secretsInHistory } = await load(import.meta.url, "P30-E47.ts");
const STRIPE = "sk_live_" + "A1b2C3d4E5f6G7h8I9";
const AWS = "AKIA" + "ABCDEFGHIJKLMNOP";
const GH = "ghp_" + "x".repeat(36);
const STRIPE2 = "sk_live_" + "Z".repeat(20);

test("הופיע ונמחק — עדיין ממצא", () => {
  const commits = [
    { sha: "c1", files: { "src/app.ts": "console.log(1)" } },
    { sha: "c2", files: { "src/app.ts": "x", ".env": `STRIPE=${STRIPE}\nAWS=${AWS}` } },
    { sha: "c3", files: { "src/app.ts": `const t = "${GH}"`, ".env.example": "STRIPE=sk_live_xxx" } },
    { sha: "c4", files: { "src/app.ts": `const t = "${GH}"; const s = "${STRIPE2}"`, "b.txt": `old ${STRIPE}` } },
  ];
  assert.deepEqual(secretsInHistory(commits), [
    { kind: "stripe", value: "sk_live_…", firstSha: "c2", stillPresent: true },
    { kind: "aws", value: "AKIAABCD…", firstSha: "c2", stillPresent: false },
    { kind: "github", value: "ghp_xxxx…", firstSha: "c3", stillPresent: true },
    { kind: "stripe", value: "sk_live_…", firstSha: "c4", stillPresent: true },
  ]);
});
test("סדר בתוך commit: לפי קובץ ואז מיקום; ערך כפול — פעם אחת", () => {
  const commits = [{ sha: "only", files: { "z.ts": `${AWS}`, "a.ts": `${GH} and ${STRIPE} and ${GH}` } }];
  assert.deepEqual(secretsInHistory(commits).map((f) => f.kind), ["github", "stripe", "aws"]);
  assert.deepEqual(secretsInHistory([]), []);
  assert.deepEqual(secretsInHistory([{ sha: "a", files: { x: "sk_live_short AKIAabcdefghijklmnop ghp_short" } }]), [], "לא מתאים לתבניות");
});
