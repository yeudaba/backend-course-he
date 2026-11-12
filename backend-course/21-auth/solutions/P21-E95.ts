// P21-E95: עמוד משימות של משתמש אחד
type Db = { query(text: string, params?: unknown[]): Promise<any> };

export async function listTasks(db: Db, ownerId: number, opts: { status?: "todo" | "done"; limit: number; offset: number }) {
  const where = "WHERE owner_id = $1 AND ($2::text IS NULL OR status = $2)";
  const status = opts.status ?? null;
  const [count, page] = await Promise.all([
    db.query(`SELECT count(*)::int AS total FROM tasks ${where}`, [ownerId, status]),
    db.query(`SELECT id, title, status FROM tasks ${where} ORDER BY created_at DESC, id DESC LIMIT $3 OFFSET $4`, [ownerId, status, opts.limit, opts.offset]),
  ]);
  return { data: page.rows, total: count.rows[0].total };
}
