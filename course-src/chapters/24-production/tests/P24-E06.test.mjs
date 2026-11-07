import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createLogger } = await load(import.meta.url, "P24-E06.ts");
const setup = (opts = {}) => {
  const lines = [];
  const log = createLogger({ sink: (l) => lines.push(l), clock: () => new Date("2026-11-04T10:00:00.000Z"), ...opts });
  return { log, lines, parsed: () => lines.map((l) => JSON.parse(l)) };
};

test("שורת JSON עם time, level, msg ושדות", () => {
  const { log, lines, parsed } = setup();
  log.info("order created", { orderId: 17, total: 99.9 });
  assert.equal(lines.length, 1);
  assert.equal(typeof lines[0], "string", "ה־sink מקבל מחרוזת");
  assert.ok(!lines[0].includes("\n"), "שורה אחת — בלי ירידות שורה (JSON.stringify בלי רווחים)");
  assert.deepEqual(parsed()[0], { time: "2026-11-04T10:00:00.000Z", level: "info", msg: "order created", orderId: 17, total: 99.9 });
});
test("רמות: ברירת מחדל info", () => {
  const { log, parsed } = setup();
  log.debug("d"); log.info("i"); log.warn("w"); log.error("e");
  assert.deepEqual(parsed().map((l) => l.level), ["info", "warn", "error"]);
});
test("רמה warn", () => {
  const { log, parsed } = setup({ level: "warn" });
  log.debug("d"); log.info("i"); log.warn("w"); log.error("e");
  assert.deepEqual(parsed().map((l) => l.msg), ["w", "e"]);
});
test("רמה debug — הכול", () => {
  const { log, parsed } = setup({ level: "debug" });
  log.debug("d"); log.info("i");
  assert.deepEqual(parsed().map((l) => l.level), ["debug", "info"]);
});
test("שדה בשם level או msg לא דורס", () => {
  const { log, parsed } = setup();
  log.warn("real", { level: "info", msg: "fake", time: "x" });
  assert.deepEqual(parsed()[0], { time: "2026-11-04T10:00:00.000Z", level: "warn", msg: "real" });
});
test("base ו־child", () => {
  const { log, parsed } = setup({ base: { service: "orders" } });
  const req = log.child({ requestId: "r-1" });
  const deeper = req.child({ userId: 7 });
  req.info("a");
  deeper.info("b", { x: 1 });
  log.info("c");
  assert.deepEqual(parsed().map(({ time, ...rest }) => rest), [
    { service: "orders", requestId: "r-1", level: "info", msg: "a" },
    { service: "orders", requestId: "r-1", userId: 7, x: 1, level: "info", msg: "b" },
    { service: "orders", level: "info", msg: "c" },
  ]);
});
test("child שומר על הרמה וה־sink", () => {
  const { log, lines } = setup({ level: "error" });
  log.child({ a: 1 }).warn("x");
  assert.equal(lines.length, 0);
  log.child({ a: 1 }).error("y");
  assert.equal(lines.length, 1);
});
