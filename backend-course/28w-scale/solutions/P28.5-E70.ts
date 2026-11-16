// P28.5-E70: ייבוא NDJSON באצוות
type Row = { id: number; name: string };

export async function importNdjson(lines: AsyncIterable<string>, insertMany: (rows: Row[]) => Promise<number>, batchSize = 1000) {
  let batch: Row[] = [];
  let inserted = 0;
  let batches = 0;
  let skipped = 0;
  const errors: string[] = [];
  let n = 0;

  const fail = (msg: string) => {
    skipped++;
    if (errors.length < 10) errors.push(`שורה ${n}: ${msg}`);
  };
  async function flush() {
    if (!batch.length) return;
    const rows = batch;
    batch = [];
    inserted += await insertMany(rows);
    batches++;
  }

  for await (const line of lines) {
    n++;
    if (!line.trim()) continue;
    let o: any;
    try {
      o = JSON.parse(line);
    } catch {
      fail("JSON לא תקין");
      continue;
    }
    if (!(Number.isInteger(o?.id) && o.id > 0 && typeof o.name === "string" && o.name.trim() !== "")) {
      fail("חסר id או name");
      continue;
    }
    batch.push({ id: o.id, name: o.name });
    if (batch.length >= batchSize) await flush();
  }
  await flush();
  return { inserted, batches, skipped, errors };
}
