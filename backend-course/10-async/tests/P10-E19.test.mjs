import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { fastestSuccess } = await load(import.meta.url, "P10-E19.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

const after = (ms, v, fail = false) => () => (fail ? failAfter(ms, v) : sleep(ms, v));
test("הראשון שהצליח", async () => assert.equal(await fastestSuccess([after(5, "x", true), after(40, "slow"), after(15, "fast")]), "fast"));
test("כולם נכשלו", async () => assert.rejects(fastestSuccess([after(5, "a", true), after(10, "b", true)]), { message: "כל המקורות נכשלו" }));
