import { test } from "node:test";
import assert from "node:assert/strict";
import { readPolicy, decide, allows } from "./_iam.mjs";

const p = readPolicy(import.meta.url, "P25.5-E21.json");
const B = "arn:aws:s3:::coffee-uploads";
const Q = "arn:aws:sqs:eu-central-1:123456789012:image-jobs";

test("ה־worker עובד: קורא מקור, כותב תמונה מוקטנת, צורך את התור", () => {
  assert.ok(allows(p, "s3:GetObject", `${B}/uploads/42/a.png`), "GetObject על אובייקט: ה־Resource צריך /uploads/* — ה־ARN של ה־bucket לא כולל את האובייקטים");
  assert.ok(allows(p, "s3:PutObject", `${B}/thumbnails/42/a.png`));
  for (const a of ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility"]) assert.ok(allows(p, a, Q), a);
});
test("ולא יותר", () => {
  assert.equal(decide(p, "s3:DeleteObject", `${B}/uploads/42/a.png`), "implicit-deny", "worker פרוץ לא מוחק קבצים של לקוחות");
  assert.equal(decide(p, "s3:PutObject", `${B}/uploads/42/a.png`), "implicit-deny", "לא דורס מקורות");
  assert.equal(decide(p, "s3:GetObject", "arn:aws:s3:::coffee-backups/db.sql"), "implicit-deny");
  assert.equal(decide(p, "sqs:SendMessage", Q), "implicit-deny");
  assert.equal(decide(p, "sqs:DeleteQueue", Q), "implicit-deny");
  assert.equal(decide(p, "sqs:ReceiveMessage", Q.replace("image-jobs", "payments")), "implicit-deny");
});
test("בלי כוכביות רחבות", () => {
  for (const s of p.Statement) {
    for (const a of [s.Action].flat()) assert.ok(!/^\*$|:\*$/.test(a), `Action "${a}"`);
    for (const r of [s.Resource].flat()) assert.notEqual(r, "*");
  }
});
