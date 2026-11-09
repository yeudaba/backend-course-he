// P30-E30
// GET /tasks?status=&sort=&order= — אחרי תיקון של הקוד שה־AI הציע
interface Db {
  query(text: string, params: unknown[]): Promise<{ rows: unknown[] }>;
}

// עמודות שמותר למיין לפיהן. שם עמודה לא יכול להיות פרמטר ($2) — לכן רשימה סגורה
const SORTS: Record<string, string> = { created: "created_at", due: "due_date", title: "title" };

export async function listTasks(
  db: Db,
  userId: number,
  { status, sort = "created", order = "asc" }: { status?: string; sort?: string; order?: string } = {}
) {
  const column = SORTS[sort];
  if (!column) throw new RangeError(`אי אפשר למיין לפי ${sort}`);
  if (order !== "asc" && order !== "desc") throw new RangeError("order: asc או desc");
  // תקלה 1: בלי user_id — כל משתמש ראה את המשימות של כולם
  const params: unknown[] = [userId];
  let sql = "SELECT id, title, status, due_date FROM tasks WHERE user_id = $1";
  if (status !== undefined) {
    params.push(status); // תקלה 2: ערך מהמשתמש — רק כפרמטר, אף פעם לא בתוך הטקסט
    sql += ` AND status = $${params.length}`;
  }
  sql += ` ORDER BY ${column} ${order.toUpperCase()}`; // תקלה 3: רק מהרשימה הסגורה
  const { rows } = await db.query(sql, params);
  return rows;
}
