// P28.5-E98: השינויים מ־PostgreSQL, לפי עמודים
type Wm = { updatedAt: string; id: number };

export async function fetchChanges(pool: { query: Function }, wm: Wm | null, limit: number) {
  const cols = "id, status, total_cents, updated_at";
  const { rows } = wm
    ? await pool.query(`SELECT ${cols} FROM orders WHERE (updated_at, id) > ($1::timestamptz, $2) ORDER BY updated_at, id LIMIT $3`, [wm.updatedAt, wm.id, limit])
    : await pool.query(`SELECT ${cols} FROM orders ORDER BY updated_at, id LIMIT $1`, [limit]);
  return rows.map((r: { id: number; status: string; total_cents: number; updated_at: Date }) => ({
    id: r.id,
    status: r.status,
    totalCents: r.total_cents,
    updatedAt: r.updated_at.toISOString(),
  }));
}
