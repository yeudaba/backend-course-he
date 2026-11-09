// P30-E30: הקוד שעוזר AI הציע לבקשה "GET /tasks עם סינון לפי status ומיון". הוא עובד — ויש בו שלוש תקלות.
interface Db {
  query(text: string, params: unknown[]): Promise<{ rows: unknown[] }>;
}

export async function listTasks(
  db: Db,
  userId: number,
  { status, sort = "created", order = "asc" }: { status?: string; sort?: string; order?: string } = {}
) {
  const columns: Record<string, string> = { created: "created_at", due: "due_date", title: "title" };
  let sql = "SELECT id, title, status, due_date FROM tasks";
  if (status !== undefined) {
    sql += ` WHERE status = '${status}'`;
  }
  sql += ` ORDER BY ${columns[sort] ?? sort} ${order}`;
  const { rows } = await db.query(sql, []);
  return rows;
}
