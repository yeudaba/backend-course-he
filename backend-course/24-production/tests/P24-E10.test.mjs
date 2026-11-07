import { test } from "node:test";
import assert from "node:assert/strict";
import { setTimeout as sleep } from "node:timers/promises";
import { load } from "../../tools/load.mjs";

const { runWithContext, getContext, setUser, logLine } = await load(import.meta.url, "P24-E10.ts");

test("בתוך ומחוץ", () => {
  assert.equal(getContext(), undefined);
  const inside = runWithContext({ requestId: "r-1" }, () => getContext());
  assert.deepEqual(inside, { requestId: "r-1" });
  assert.equal(getContext(), undefined, "אחרי הסוף — אין הקשר");
  assert.equal(runWithContext({ requestId: "r" }, () => 42), 42, "מחזיר את מה ש־fn מחזירה");
});
test("שורד await ו־setTimeout", async () => {
  const seen = await runWithContext({ requestId: "r-2" }, async () => {
    await sleep(5);
    const a = getContext()?.requestId;
    const b = await new Promise((r) => setTimeout(() => r(getContext()?.requestId), 5));
    return [a, b];
  });
  assert.deepEqual(seen, ["r-2", "r-2"]);
});
test("בקשות במקביל לא מתערבבות", async () => {
  const one = async (id, ms) => runWithContext({ requestId: id }, async () => {
    await sleep(ms);
    setUser(Number(id.slice(2)));
    await sleep(ms);
    return logLine("done");
  });
  const lines = await Promise.all([one("r-1", 15), one("r-2", 5), one("r-3", 10)]);
  assert.deepEqual(lines.map((l) => JSON.parse(l)), [
    { msg: "done", requestId: "r-1", userId: 1 },
    { msg: "done", requestId: "r-2", userId: 2 },
    { msg: "done", requestId: "r-3", userId: 3 },
  ]);
});
test("setUser מחוץ להקשר", () => {
  assert.throws(() => setUser(1), { message: "אין הקשר של בקשה" });
});
test("logLine בלי הקשר, ועם שדות", () => {
  assert.deepEqual(JSON.parse(logLine("boot", { port: 3000 })), { msg: "boot", port: 3000 });
  runWithContext({ requestId: "r-9" }, () => {
    assert.deepEqual(JSON.parse(logLine("x", { a: 1 })), { msg: "x", requestId: "r-9", a: 1 });
  });
});
test("ההקשר שהועבר לא משתנה מבחוץ", () => {
  const ctx = { requestId: "r-5" };
  runWithContext(ctx, () => setUser(5));
  assert.deepEqual(ctx, { requestId: "r-5" }, "runWithContext שומר עותק");
});
