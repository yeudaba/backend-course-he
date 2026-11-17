import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { junitSummary } = await load(import.meta.url, "P26.3-E93.ts");

test("סופר לפי testcase, ושמות מפוענחים", () => {
  const xml = `<?xml version="1.0"?>
<testsuites><testsuite name="orders" tests="99" failures="0">
  <testcase classname="orders" name="creates an order" time="0.01"/>
  <testcase classname="orders" name="POST /orders &amp; &lt;validation&gt;" time="0.02">
    <failure message="expected 400">AssertionError: expected 400, got 201</failure>
  </testcase>
  <testcase classname="orders" name="expires &quot;unpaid&quot;"><error message="timeout">Error: timeout</error></testcase>
  <testcase classname="cart" name="skipped one"><skipped/></testcase>
  <testcase classname="cart" name="adds item"></testcase>
</testsuite></testsuites>`;
  assert.deepEqual(junitSummary(xml), {
    tests: 5,
    failures: 1,
    errors: 1,
    skipped: 1,
    failed: ["orders › POST /orders & <validation>", 'orders › expires "unpaid"'],
  });
});
test("ריק, ו־&amp;lt; לא מפוענח פעמיים", () => {
  assert.deepEqual(junitSummary("<testsuites/>"), { tests: 0, failures: 0, errors: 0, skipped: 0, failed: [] });
  const r = junitSummary('<testcase classname="a" name="x &amp;lt; y"><failure/></testcase>');
  assert.deepEqual(r.failed, ["a › x &lt; y"]);
});
