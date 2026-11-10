import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const FILE = "P26-E32.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseInfo", "parseKeyspace", "hitRatio"]);
const SAMPLE = "# Server\r\nredis_version:8.2.1\r\nos:Linux 6.10 aarch64\r\nlistener0:name=tcp,bind=*,port=6379\r\n\r\n# Stats\r\nkeyspace_hits:1520\r\nkeyspace_misses:480\r\n\r\n# Keyspace\r\ndb0:keys=1204,expires=980,avg_ttl=512331,subexpiry=0\r\ndb3:keys=7,expires=0,avg_ttl=0\r\n";

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("parseInfo — מקטעים באותיות קטנות, ערך אחרי הנקודתיים הראשונות", async () => {
  const { parseInfo } = await get();
  const info = parseInfo(SAMPLE);
  assert.deepEqual(Object.keys(info), ["server", "stats", "keyspace"]);
  assert.deepEqual(info.server, { redis_version: "8.2.1", os: "Linux 6.10 aarch64", listener0: "name=tcp,bind=*,port=6379" }, "\\r בסוף השורה לא נשאר בערך");
  assert.equal(info.stats.keyspace_hits, "1520", "הערכים נשארים מחרוזות");
  assert.deepEqual(parseInfo("# Persistence\nrdb_last_save_time:1794348081\nweird:a:b:c\n"), { persistence: { rdb_last_save_time: "1794348081", weird: "a:b:c" } }, "גם \\n בלבד; נקודתיים בתוך הערך נשארות");
  assert.deepEqual(parseInfo(""), {});
});
test("parseKeyspace — מספרים", async () => {
  const { parseInfo, parseKeyspace } = await get();
  assert.deepEqual(parseKeyspace(parseInfo(SAMPLE)), {
    db0: { keys: 1204, expires: 980, avg_ttl: 512331, subexpiry: 0 },
    db3: { keys: 7, expires: 0, avg_ttl: 0 },
  });
  assert.deepEqual(parseKeyspace(parseInfo("# Server\nredis_version:8\n")), {}, "בלי מקטע keyspace (מסד ריק) — {}");
});
test("hitRatio — שלוש ספרות, ו־null כשאין נתונים", async () => {
  const { parseInfo, hitRatio } = await get();
  assert.equal(hitRatio(parseInfo(SAMPLE)), 0.76);
  assert.equal(hitRatio(parseInfo("# Stats\nkeyspace_hits:2\nkeyspace_misses:1\n")), 0.667);
  assert.equal(hitRatio(parseInfo("# Stats\nkeyspace_hits:0\nkeyspace_misses:0\n")), null, "0/0 — null, לא NaN");
  assert.equal(hitRatio(parseInfo("# Server\nredis_version:8\n")), null, "בלי מקטע stats");
});
test("על INFO אמיתי של Redis", async (t) => {
  const { parseInfo, hitRatio } = await get();
  const { raw } = await redisSandbox(t);
  const info = parseInfo(await raw.info());
  assert.match(info.server?.redis_version ?? "", /^\d+\.\d+\.\d+$/, "server.redis_version");
  assert.match(info.server.redis_version, /^[^\r]*$/);
  assert.ok(Number(info.clients?.connected_clients) >= 1, "clients.connected_clients");
  const r = hitRatio(info);
  assert.ok(r === null || (r >= 0 && r <= 1), `hitRatio: ${r}`);
});
