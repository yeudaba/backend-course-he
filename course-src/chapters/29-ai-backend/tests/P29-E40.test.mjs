import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { redactSecrets } = await load(import.meta.url, "P29-E40.ts");

test("עמוק, בלי לשנות את המקור", () => {
  const input = {
    msg: "failed with key sk-ant-api03-AbC_12-xyz and more",
    request: { headers: { "X-API-Key": "anything", Authorization: "Bearer abc", accept: "json" }, apiKey: 12345 },
    list: ["ok", "sk-ant-zzz", 5, null, true, { nested: "sk-ant-a1 sk-ant-b2" }],
    n: 3,
  };
  const copy = structuredClone(input);
  assert.deepEqual(redactSecrets(input), {
    msg: "failed with key sk-ant-*** and more",
    request: { headers: { "X-API-Key": "***", Authorization: "***", accept: "json" }, apiKey: "***" },
    list: ["ok", "sk-ant-***", 5, null, true, { nested: "sk-ant-*** sk-ant-***" }],
    n: 3,
  });
  assert.deepEqual(input, copy);
});
test("ערכים פשוטים", () => {
  assert.equal(redactSecrets("plain"), "plain");
  assert.equal(redactSecrets(7), 7);
  assert.equal(redactSecrets(null), null);
  assert.equal(redactSecrets('{"k":"sk-ant-1"}'), '{"k":"sk-ant-***"}');
});
