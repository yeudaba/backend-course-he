import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { typeEscapes } = await load(import.meta.url, "P30-E106.ts");

test("כל הסוגים", () => {
  const src = [
    `const user = req.user!.id;`,
    `// @ts-ignore`,
    `const x = data as any;`,
    `function f(a: any, b:any): string { return a!; }`,
    `const y = (await load())!.value as   any; // @ts-expect-error later`,
    `const z = arr[0]![1];`,
    `if (a != b && c !== d) {}`,
  ].join("\n");
  assert.deepEqual(typeEscapes(src), [
    { line: 1, kind: "non-null" },
    { line: 2, kind: "ts-ignore" },
    { line: 3, kind: "as-any" },
    { line: 4, kind: "explicit-any" },
    { line: 4, kind: "non-null" },
    { line: 5, kind: "ts-ignore" },
    { line: 5, kind: "as-any" },
    { line: 5, kind: "non-null" },
    { line: 6, kind: "non-null" },
  ]);
});
test("מחרוזות והערות לא נספרות", () => {
  const src = [
    `const s = "value as any here: any!.";`,
    `const t = 'it\\'s as any';`,
    "const u = `a!.b ${'x'}`;",
    `// this is as any in a comment, not code: any`,
    `const url = "https://example.com"; const k = obj!.key;`,
    `/* @ts-ignore inside block */ const ok = 1;`,
    `const msg = "// @ts-ignore";`,
    `const company: Company = anything;`,
  ].join("\n");
  assert.deepEqual(typeEscapes(src), [
    { line: 5, kind: "non-null" },
    { line: 6, kind: "ts-ignore" },
  ]);
  assert.deepEqual(typeEscapes(""), []);
});
