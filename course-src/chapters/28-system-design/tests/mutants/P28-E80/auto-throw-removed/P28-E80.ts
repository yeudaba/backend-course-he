// P28-E80: שאילתת keyset עם פרמטרים
export function keysetQuery(table: string, opts: { limit: number; after?: { createdAt: string; id: number } }) {
  if (!/^[a-z_][a-z0-9_]*$/.test(table)) throw new Error(`שם טבלה לא תקין: ${table}`);

  const values: (string | number)[] = [];
  let where = "";
  if (opts.after) {
    values.push(opts.after.createdAt, opts.after.id);
    where = " WHERE (created_at, id) < ($1, $2)";
  }
  values.push(opts.limit);
  return { text: `SELECT * FROM ${table}${where} ORDER BY created_at DESC, id DESC LIMIT $${values.length}`, values };
}
