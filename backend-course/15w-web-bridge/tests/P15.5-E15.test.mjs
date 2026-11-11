import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E15.mjs", ["loadDashboard"])).loadDashboard;

// שרת מדומה: כל בקשה לוקחת 60ms. failing — נתיבים שנכשלים, עם השגיאה שלהם
function fakeApi(failing = {}) {
  const data = { "/me": { id: 1, name: "דנה" }, "/tasks": [{ id: 1 }], "/stats": { open: 3 } };
  const calls = [];
  const getJson = async (path) => {
    calls.push(path);
    await new Promise((r) => setTimeout(r, 60));
    if (failing[path]) throw failing[path];
    return data[path];
  };
  return { getJson, calls };
}

test("הכול הצליח — במקביל", async () => {
  const loadDashboard = await get();
  const { getJson, calls } = fakeApi();
  const start = Date.now();
  const r = await loadDashboard(getJson);
  const ms = Date.now() - start;
  assert.deepEqual(r, { me: { id: 1, name: "דנה" }, tasks: [{ id: 1 }], stats: { open: 3 }, errors: [] });
  assert.deepEqual([...calls].sort(), ["/me", "/stats", "/tasks"]);
  assert.ok(ms < 150, `לקח ${ms}ms — שלוש בקשות של 60ms צריכות לצאת יחד (Promise.allSettled), לא אחת אחרי השנייה`);
});
test("stats נכשלה — הדף מוצג, עם שגיאה", async () => {
  const loadDashboard = await get();
  const { getJson } = fakeApi({ "/stats": new Error("503 Service Unavailable") });
  assert.deepEqual(await loadDashboard(getJson), { me: { id: 1, name: "דנה" }, tasks: [{ id: 1 }], stats: null, errors: ["stats: 503 Service Unavailable"] });
});
test("tasks ו־stats נכשלו — שתי שגיאות, לפי הסדר", async () => {
  const loadDashboard = await get();
  const { getJson } = fakeApi({ "/stats": new Error("B"), "/tasks": new Error("A") });
  const r = await loadDashboard(getJson);
  assert.equal(r.tasks, null);
  assert.equal(r.stats, null);
  assert.deepEqual(r.errors, ["tasks: A", "stats: B"]);
});
test("me נכשלה — אותה שגיאה בדיוק נזרקת", async () => {
  const loadDashboard = await get();
  const err = Object.assign(new Error("נדרשת התחברות"), { status: 401 });
  const { getJson } = fakeApi({ "/me": err, "/stats": new Error("גם זה") });
  await assert.rejects(loadDashboard(getJson), (e) => {
    assert.equal(e, err, "צריך לזרוק את השגיאה המקורית (throw me.reason), לא שגיאה חדשה");
    return true;
  });
});
