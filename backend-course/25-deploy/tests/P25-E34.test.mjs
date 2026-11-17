import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E34.ts", ["yamlTraps"])).yamlTraps;

test("ערכים שמשתנים", async () => {
  const f = await get();
  const text = [
    "jobs:",
    "  test:",
    "    steps:",
    "      - uses: actions/setup-node@v5",
    "        with:",
    "          node-version: 24",
    "          python-version: 3.10   # לא 3.1!",
    "      - name: build",
    "        env:",
    "          PORT: 08",
    "          RATIO: 1e3",
    "          ENABLED: true",
    "          VERSION: 1.0",
    "          QUOTED: \"1.10\"",
    "          LIST: [1.10]",
    "          HOME: /home/runner",
    "          ZIP: 0x1F",
    "          EMPTY:",
    "          TOKEN: ${{ secrets.T }}",
  ].join("\n");
  assert.deepEqual(f(text), [
    { line: 7, key: "python-version", raw: "3.10", parsed: 3.1 },
    { line: 10, key: "PORT", raw: "08", parsed: 8 },
    { line: 11, key: "RATIO", raw: "1e3", parsed: 1000 },
    { line: 13, key: "VERSION", raw: "1.0", parsed: 1 },
    { line: 17, key: "ZIP", raw: "0x1F", parsed: 31 },
  ]);
});
test("בלי מלכודות", async () => {
  const f = await get();
  assert.deepEqual(f("on: [push]\nname: CI\ntimeout-minutes: 15\nflag: NO\nempty: ~x"), []);
  assert.deepEqual(f(""), []);
  assert.deepEqual(f("- run: npm test # comment"), []);
});
