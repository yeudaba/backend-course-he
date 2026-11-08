import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { extractSkills, matchJob } = await load(import.meta.url, "P30-E18.ts");
const ad = `Junior Backend Developer. Requirements: experience with Node.js or NestJS, TypeScript,
PostgreSQL / MySQL, REST APIs, Docker. Advantage: Kubernetes (k8s), AWS, Kafka. We love tests (Jest).`;

test("מחלץ כישורים עם כינויים, בלי כפילויות", () => {
  assert.deepEqual(extractSkills(ad), ["Node.js", "TypeScript", "NestJS", "PostgreSQL", "MySQL", "Docker", "Kubernetes", "AWS", "REST", "Kafka", "Testing"]);
});
test("לא מתבלבל: 'the rest of', 'go to', 'ts' בתוך מילה, Java בתוך JavaScript", () => {
  assert.deepEqual(extractSkills("You will go to meetings with the rest of the team; experts welcome"), []);
  assert.deepEqual(extractSkills("javascript and postgres"), ["JavaScript", "PostgreSQL"]);
});
test("matchJob: מה יש, מה חסר, וציון", () => {
  const r = matchJob(ad, ["node", "typescript", "nestjs", "postgres", "docker", "redis", "jest", "github actions"]);
  assert.deepEqual(r.matched, ["Node.js", "TypeScript", "NestJS", "PostgreSQL", "Docker", "Testing"]);
  assert.deepEqual(r.missing, ["MySQL", "Kubernetes", "AWS", "REST", "Kafka"]);
  assert.equal(r.score, 0.55);
  assert.equal(matchJob("Senior chef", ["node"]).score, 0);
});
