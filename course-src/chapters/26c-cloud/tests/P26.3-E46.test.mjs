import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("סכום ואחוז לכל שירות, רק בנובמבר", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE costs (day date NOT NULL, service text NOT NULL, usd numeric(10,2) NOT NULL);
    INSERT INTO costs VALUES
      ('2026-10-31', 'EKS', 500.00),
      ('2026-11-01', 'EKS', 40.00), ('2026-11-02', 'EKS', 40.00), ('2026-11-30', 'EKS', 20.00),
      ('2026-11-01', 'RDS', 30.00), ('2026-11-15', 'RDS', 30.00),
      ('2026-11-03', 'S3', 2.50), ('2026-11-04', 'S3', 2.50),
      ('2026-11-05', 'SQS', 5.00),
      ('2026-11-06', 'CloudWatch', 5.00),
      ('2026-12-01', 'RDS', 999.00)`);
  const rows = await db.fileRows("P26.3-E46.sql");
  assert.deepEqual(rows, [
    { service: "EKS", total: 100, share: 57.1 },
    { service: "RDS", total: 60, share: 34.3 },
    { service: "CloudWatch", total: 5, share: 2.9 },
    { service: "S3", total: 5, share: 2.9 },
    { service: "SQS", total: 5, share: 2.9 },
  ]);
});
