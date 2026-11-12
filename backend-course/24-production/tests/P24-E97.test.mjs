import { test } from "node:test";
import assert from "node:assert/strict";
import { Logger } from "@nestjs/common";
import { exportsOf } from "./_ts.mjs";

const NOW = new Date("2026-11-07T15:30:00.000Z");
async function make(level = "debug") {
  const { JsonLogger } = await exportsOf(import.meta.url, "P24-E97.ts", ["JsonLogger"]);
  const lines = [];
  const logger = new JsonLogger({ sink: (l) => lines.push(l), now: () => NOW, level });
  return { logger, lines, parsed: () => lines.map((l) => JSON.parse(l)) };
}

test("ישירות: רמות ושדות", async () => {
  const { logger, lines, parsed } = await make();
  logger.log("server started", "Main");
  logger.warn("slow");
  logger.debug({ a: 1 }, "Db");
  logger.verbose("v", "");
  logger.fatal("dead", "Main");
  logger.error("boom", "STACK-LINES", "Tasks");
  assert.ok(lines.every((l) => typeof l === "string" && !l.includes("\n")));
  assert.deepEqual(parsed(), [
    { time: "2026-11-07T15:30:00.000Z", level: "info", msg: "server started", context: "Main" },
    { time: "2026-11-07T15:30:00.000Z", level: "warn", msg: "slow" },
    { time: "2026-11-07T15:30:00.000Z", level: "debug", msg: '{"a":1}', context: "Db" },
    { time: "2026-11-07T15:30:00.000Z", level: "debug", msg: "v" },
    { time: "2026-11-07T15:30:00.000Z", level: "error", msg: "dead", context: "Main" },
    { time: "2026-11-07T15:30:00.000Z", level: "error", msg: "boom", context: "Tasks", stack: "STACK-LINES" },
  ]);
});
test("Error כהודעה", async () => {
  const { logger, parsed } = await make();
  const err = new Error("db down");
  logger.error(err, undefined, "Prisma");
  logger.warn(new TypeError("t"));
  const [a, b] = parsed();
  assert.equal(a.msg, "db down");
  assert.equal(a.stack, err.stack);
  assert.equal(a.context, "Prisma");
  assert.equal(b.msg, "t");
  assert.equal(b.level, "warn");
});
test("רמה מינימלית", async () => {
  const { logger, parsed } = await make("warn");
  logger.debug("d");
  logger.verbose("v");
  logger.log("i");
  logger.warn("w");
  logger.error("e");
  logger.fatal("f");
  assert.deepEqual(parsed().map((p) => p.level + ":" + p.msg), ["warn:w", "error:e", "error:f"]);
});
test("מחובר ל־Nest: Logger.overrideLogger", async (t) => {
  const { logger, parsed } = await make("info");
  Logger.overrideLogger(logger);
  t.after(() => Logger.overrideLogger(false));
  const log = new Logger("Tasks");
  log.log("hi");
  log.error("boom", "at x (y.ts:1:1)");
  log.debug("hidden");
  assert.deepEqual(parsed().map(({ time, ...rest }) => rest), [
    { level: "info", msg: "hi", context: "Tasks" },
    { level: "error", msg: "boom", context: "Tasks", stack: "at x (y.ts:1:1)" },
  ]);
});
