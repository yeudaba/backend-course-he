// P29-E98: שליפת מסמכים מ־PostgreSQL, לפי הרשאה
type Db = { query(text: string, params: unknown[]): Promise<{ rows: any[] }> };

export async function searchDocs(db: Db, question: string, opts: { role: "customer" | "staff"; k?: number }) {
  const words = [...new Set((question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []))];
  if (words.length === 0) return [];
  const params: unknown[] = words.map((w) => `%${w}%`);
  const score = words.map((_, i) => `((title || ' ' || body) ILIKE $${i + 1})::int`).join(" + ");
  params.push(opts.role === "staff", opts.k ?? 3);
  const n = words.length;
  const { rows } = await db.query(
    `SELECT id, title, score FROM (
       SELECT id, title, ${score} AS score FROM docs WHERE internal = false OR $${n + 1}
     ) s
     WHERE score > 0
     ORDER BY score DESC, id
     LIMIT $${n + 2}`,
    params,
  );
  return rows.map((r) => ({ id: r.id, title: r.title, score: Number(r.score) }));
}
