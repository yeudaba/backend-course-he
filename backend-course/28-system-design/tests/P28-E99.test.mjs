import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { fanoutJobs } = await load(import.meta.url, "P28-E99.ts");

test("חבילות עם jobId קבוע", () => {
  const followers = ["a", "b", "c", "b", "d", "e", "a"];
  const jobs = fanoutJobs(42, followers, 2);
  assert.deepEqual(jobs, [
    { name: "fanout", data: { postId: 42, followers: ["a", "b"] }, opts: { jobId: "fanout:42:0" } },
    { name: "fanout", data: { postId: 42, followers: ["c", "d"] }, opts: { jobId: "fanout:42:1" } },
    { name: "fanout", data: { postId: 42, followers: ["e"] }, opts: { jobId: "fanout:42:2" } },
  ]);
  assert.deepEqual(fanoutJobs(42, followers, 2), jobs, "אותה קריאה — אותם jobs");
});
test("ברירת מחדל 1,000", () => {
  const followers = Array.from({ length: 2500 }, (_, i) => `u${i}`);
  const jobs = fanoutJobs(7, followers);
  assert.deepEqual(jobs.map((j) => j.data.followers.length), [1000, 1000, 500]);
  assert.equal(jobs[2].opts.jobId, "fanout:7:2");
  assert.equal(jobs[1].data.followers[0], "u1000");
});
test("קצוות", () => {
  assert.deepEqual(fanoutJobs(1, []), []);
  for (const bad of [0, -1, 2.5]) assert.throws(() => fanoutJobs(1, ["a"], bad), RangeError);
});
