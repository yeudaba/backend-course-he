import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E53: posts ו־comments", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E53.prisma");
  assert.deepEqual(await columns(db, "posts"), {
    body: "text NOT NULL", id: "integer NOT NULL DEFAULT autoincrement", published_at: "timestamp with time zone", title: "text NOT NULL",
  });
  assert.deepEqual(await columns(db, "comments"), {
    author: "text NOT NULL", created_at: "timestamp with time zone NOT NULL DEFAULT now", id: "integer NOT NULL DEFAULT autoincrement", post_id: "integer NOT NULL", text: "text NOT NULL",
  });
  await db.query("INSERT INTO posts (title, body) VALUES ('a', 'b'), ('c', 'd')");
  await db.query("INSERT INTO comments (post_id, author, text) VALUES (1, 'x', 'y'), (1, 'x', 'z'), (2, 'q', 'w')");
  await assert.rejects(db.query("INSERT INTO comments (post_id, author, text) VALUES (9, 'x', 'y')"), undefined, "תגובה לפוסט שלא קיים");
  await db.query("DELETE FROM posts WHERE id = 1");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM comments"))[0].n, 1, "מחיקת פוסט מוחקת את התגובות שלו");
  const idx = await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'comments' AND indexdef LIKE '%(post_id)%'");
  assert.equal(idx.length, 1, "index על post_id");
});
