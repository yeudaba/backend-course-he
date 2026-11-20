import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { inFlight, parallelMessage } from "./_par.mjs";

const { getProfilePage } = await load(import.meta.url, "P10-E23.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

const api = (failRecs = false) => ({
  getUser: (id) => sleep(80, { id, name: "דנה" }),
  getOrders: () => sleep(80, [1, 2]),
  getRecommendations: () => (failRecs ? failAfter(80, "down") : sleep(80, ["x"])),
});
test("תוצאה נכונה", async () => {
  assert.deepEqual(await getProfilePage(1, api()), { name: "דנה", orderCount: 2, recommendations: ["x"] });
});
test("שלוש הקריאות במקביל", async () => {
  const call = inFlight((fn, id) => fn(id));
  const slow = api();
  const counted = {
    getUser: (id) => call.fn(slow.getUser, id),
    getOrders: (id) => call.fn(slow.getOrders, id),
    getRecommendations: (id) => call.fn(slow.getRecommendations, id),
  };
  await getProfilePage(1, counted);
  assert.equal(call.max, 3, parallelMessage(call.max, 3));
});
test("כשל בהמלצות לא מפיל", async () => assert.deepEqual(await getProfilePage(1, api(true)), { name: "דנה", orderCount: 2, recommendations: [] }));
