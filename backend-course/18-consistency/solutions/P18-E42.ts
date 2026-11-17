// P18-E42: ייבוא העברות מ־CSV
import type { Pool } from "pg";

type Row = { n: number; from: number; to: number; amount: number };

function parse(csv: string): Row[] {
  const rows: Row[] = [];
  csv.split(/\r?\n/).forEach((line, i) => {
    const n = i + 1;
    if (n === 1 || line.trim() === "") return;
    const parts = line.split(",").map((s) => s.trim());
    const [from, to, amount] = parts.map(Number);
    const ok = parts.length === 3 && parts.every((p) => p !== "") && Number.isInteger(from) && from > 0 && Number.isInteger(to) && to > 0 && amount > 0;
    if (!ok) throw new Error(`שורה ${n}: לא תקינה`);
    rows.push({ n, from, to, amount });
  });
  return rows;
}

export async function importTransfers(pool: Pool, csv: string): Promise<number> {
  const rows = parse(csv);
  const client = await pool.connect();
  let current = 0;
  try {
    await client.query("BEGIN");
    for (const r of rows) {
      current = r.n;
      await client.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [r.amount, r.from]);
      await client.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [r.amount, r.to]);
      await client.query("INSERT INTO transfers (from_id, to_id, amount) VALUES ($1, $2, $3)", [r.from, r.to, r.amount]);
    }
    await client.query("COMMIT");
    return rows.length;
  } catch (err: any) {
    await client.query("ROLLBACK");
    throw new Error(`שורה ${current}: ${err.message}`);
  } finally {
    client.release();
  }
}
