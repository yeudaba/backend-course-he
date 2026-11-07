import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createLogger, logRequest } = await load(import.meta.url, "P24-E20.ts");
const setup = (level) => {
  const lines = [];
  return { log: createLogger({ level, sink: (l) => lines.push(JSON.parse(l)) }), lines };
};

test("רמות", () => {
  const { log, lines } = setup("info");
  log.debug("d"); log.info("i"); log.warn("w"); log.error("e");
  assert.deepEqual(lines.map((l) => l.msg), ["i", "w", "e"], "ב־info: גם warn וגם error נכתבים");
  const w = setup("warn");
  w.log.info("i"); w.log.error("e"); w.log.warn("w");
  assert.deepEqual(w.lines.map((l) => l.msg), ["e", "w"]);
});
test("סודות — בכל עומק", () => {
  const { log, lines } = setup();
  log.info("signup", { password: "a", user: { email: "d@x.com", password: "b" }, tokens: [{ refreshToken: "c" }] });
  const text = JSON.stringify(lines);
  for (const s of ['"a"', '"b"', '"c"']) assert.ok(!text.includes(s), `הערך ${s} דלף`);
  assert.equal(lines[0].user.email, "d@x.com");
});
test("logRequest — בלי query", () => {
  const { log, lines } = setup();
  logRequest(log, { method: "GET", url: "/reset-password?token=abc123&x=1" }, 200);
  assert.deepEqual(lines[0], { level: "info", msg: "request", method: "GET", path: "/reset-password", status: 200 });
});
