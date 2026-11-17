import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { plan } = await load(import.meta.url, "P26.3-E39.ts");
const r = (type, name, props) => ({ type, name, props });

test("create, update, delete, unchanged", () => {
  const desired = [
    r("aws_s3_bucket", "receipts", { versioning: true, tags: { env: "prod" } }),
    r("aws_db_instance", "main", { engine: "postgres", size: "db.t4g.small", multiAz: true }),
    r("aws_sqs_queue", "orders", { fifo: false }),
    r("aws_s3_bucket", "images", { versioning: false }),
  ];
  const actual = [
    r("aws_db_instance", "main", { engine: "postgres", size: "db.t4g.micro", backup: 7 }),
    r("aws_s3_bucket", "receipts", { versioning: true, tags: { env: "prod" } }),
    r("aws_iam_user", "old-deployer", {}),
    r("aws_s3_bucket", "images", { versioning: true }),
  ];
  assert.deepEqual(plan(desired, actual), {
    create: ["aws_sqs_queue.orders"],
    update: [
      { id: "aws_db_instance.main", changes: ["backup", "multiAz", "size"] },
      { id: "aws_s3_bucket.images", changes: ["versioning"] },
    ],
    delete: ["aws_iam_user.old-deployer"],
    unchanged: 1,
  });
});
test("השוואה עמוקה, וריקים", () => {
  assert.deepEqual(plan([r("t", "a", { list: [1, 2] })], [r("t", "a", { list: [1, 2] })]), { create: [], update: [], delete: [], unchanged: 1 });
  assert.deepEqual(plan([r("t", "a", { list: [1, 2] })], [r("t", "a", { list: [2, 1] })]).update, [{ id: "t.a", changes: ["list"] }]);
  assert.deepEqual(plan([], []), { create: [], update: [], delete: [], unchanged: 0 });
  assert.deepEqual(plan([r("b", "x", {}), r("a", "y", {})], []).create, ["a.y", "b.x"], "ממוין");
});
