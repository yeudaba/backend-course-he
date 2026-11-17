import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { ec2Monthly, lambdaMonthly, cheaper } = await load(import.meta.url, "P26.3-E36.ts");

test("ec2Monthly", () => {
  assert.equal(ec2Monthly(0.0208, 2), 30.37);
  assert.equal(ec2Monthly(0.1, 3, 100), 30);
  assert.equal(ec2Monthly(0.0416, 1), 30.37);
});
test("lambdaMonthly", () => {
  assert.equal(lambdaMonthly({ requests: 6000, avgMs: 50, memoryMb: 128 }), 0);
  assert.equal(lambdaMonthly({ requests: 1_000_000, avgMs: 200, memoryMb: 512 }), 1.87);
  assert.equal(lambdaMonthly({ requests: 259_200_000, avgMs: 80, memoryMb: 1024 }), 397.44);
  assert.equal(lambdaMonthly({ requests: 2_000_000, avgMs: 1000, memoryMb: 2048, perMillionRequests: 0.25, perGbSecond: 0.00002 }), 80.5);
});
test("cheaper", () => {
  assert.equal(cheaper(30.37, 0), "lambda");
  assert.equal(cheaper(30.37, 397.44), "ec2");
  assert.equal(cheaper(5, 5), "same");
});
