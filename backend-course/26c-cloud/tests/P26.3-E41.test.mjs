import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { findSecrets } = await load(import.meta.url, "P26.3-E41.ts");
const AK = "AKIA" + "IOSFODNN7EXAMPLE";
const SK = "wJalrXUtnFEMI/K7MDENG/bPxRfiCY" + "EXAMPLEKEY";
const GH = "ghp_" + "a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8";

test("שלושת הסוגים, עם מספר שורה ו־preview", () => {
  const text = [
    "# config",
    `AWS_ACCESS_KEY_ID=${AK}`,
    `aws_secret_access_key = "${SK}"`,
    "nothing here",
    `token: ${GH} and again ASIA${"Q".repeat(16)}`,
  ].join("\n");
  assert.deepEqual(findSecrets(text), [
    { line: 2, kind: "aws-access-key", preview: "AKIA…" },
    { line: 3, kind: "aws-secret-key", preview: "wJal…" },
    { line: 5, kind: "github-token", preview: "ghp_…" },
    { line: 5, kind: "aws-access-key", preview: "ASIA…" },
  ]);
});
test("לא מזהה דברים שרק דומים", () => {
  const text = [
    `AKIA${"A".repeat(15)}`,
    `XAKIA${"A".repeat(16)}`,
    `AKIA${"a".repeat(16)}`,
    `ghp_${"x".repeat(20)}`,
    `aws_secret_access_key=${"x".repeat(39)}`,
    "AWS_SECRET_ACCESS_KEY: " + SK,
  ].join("\r\n");
  assert.deepEqual(findSecrets(text), [{ line: 6, kind: "aws-secret-key", preview: "wJal…" }], "רק השורה האחרונה (בלי תלות באותיות גדולות)");
  assert.deepEqual(findSecrets(""), []);
});
test("הסוד המלא לא מופיע בפלט", () => {
  const out = JSON.stringify(findSecrets(`a=${AK}\nb=${GH}`));
  assert.ok(!out.includes(AK) && !out.includes(GH));
});
