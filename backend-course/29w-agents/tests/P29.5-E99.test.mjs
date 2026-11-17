import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { saveEvalRun, passRateTrend } = await load(import.meta.url, "P29.5-E99.ts");
const TABLES = `CREATE TABLE eval_runs (id serial PRIMARY KEY, git_sha text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
  CREATE TABLE eval_results (run_id int NOT NULL REFERENCES eval_runs, scenario text NOT NULL, trials int NOT NULL, passes int NOT NULL, PRIMARY KEY (run_id, scenario));`;

test("שמירה ומגמה", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLES);
  const ids = [];
  ids.push(await saveEvalRun(db.client, { gitSha: "a1", results: [{ scenario: "refund", trials: 3, passes: 3 }, { scenario: "status", trials: 3, passes: 2 }] }));
  ids.push(await saveEvalRun(db.client, { gitSha: "b2", results: [{ scenario: "status", trials: 3, passes: 3 }] }));
  ids.push(await saveEvalRun(db.client, { gitSha: "c3", results: [{ scenario: "refund", trials: 3, passes: 2 }, { scenario: "status", trials: 6, passes: 5 }] }));
  ids.push(await saveEvalRun(db.client, { gitSha: "d4", results: [{ scenario: "refund", trials: 3, passes: 1 }] }));
  assert.equal(new Set(ids).size, 4);
  assert.ok(ids.every((x) => Number.isInteger(x)));
  assert.deepEqual(await passRateTrend(db.client, "refund", 2), [{ runId: ids[2], gitSha: "c3", passRate: 0.67 }, { runId: ids[3], gitSha: "d4", passRate: 0.33 }]);
  assert.deepEqual(await passRateTrend(db.client, "refund", 10), [{ runId: ids[0], gitSha: "a1", passRate: 1 }, { runId: ids[2], gitSha: "c3", passRate: 0.67 }, { runId: ids[3], gitSha: "d4", passRate: 0.33 }]);
  assert.deepEqual(await passRateTrend(db.client, "status", 2), [{ runId: ids[1], gitSha: "b2", passRate: 1 }, { runId: ids[2], gitSha: "c3", passRate: 0.83 }], "הרצה d4 בלי status לא תופסת מקום");
  assert.deepEqual(await passRateTrend(db.client, "nope", 3), []);
  assert.deepEqual(await passRateTrend(db.client, "x' OR '1'='1", 3), []);
});
test("ולידציה לפני המסד, וטרנזקציה", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLES);
  for (const r of [{ trials: 0, passes: 0 }, { trials: 3, passes: 4 }, { trials: 3, passes: -1 }, { trials: 2.5, passes: 1 }, { trials: 3, passes: 1.5 }]) {
    await assert.rejects(saveEvalRun(db.client, { gitSha: "x", results: [{ scenario: "s", ...r }] }), RangeError, JSON.stringify(r));
  }
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM eval_runs"))[0].n, 0, "ולידציה לפני INSERT");
  await assert.rejects(saveEvalRun(db.client, { gitSha: "dup", results: [{ scenario: "s", trials: 1, passes: 1 }, { scenario: "s", trials: 1, passes: 0 }] }));
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM eval_runs"))[0].n, 0, "ROLLBACK — גם ה־run לא נשמר");
  assert.ok(await saveEvalRun(db.client, { gitSha: "ok", results: [] }), "החיבור תקין אחרי ROLLBACK");
});
