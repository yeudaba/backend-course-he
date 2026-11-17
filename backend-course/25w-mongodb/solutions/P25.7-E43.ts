// P25.7-E43: seed מקובץ JSON
import type { Db } from "mongodb";

export async function loadSeed(db: Db, jsonText: string) {
  let data: Record<string, Record<string, unknown>[]>;
  try {
    data = JSON.parse(jsonText, (key, value) => {
      if (!key.endsWith("At") || typeof value !== "string") return value;
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) throw new Error(`תאריך לא תקין בשדה ${key}`);
      return d;
    });
  } catch (err) {
    if (err instanceof SyntaxError) throw new Error("JSON לא תקין");
    throw err;
  }
  const counts: Record<string, number> = {};
  for (const [name, docs] of Object.entries(data)) {
    if (docs.length) await db.collection(name).insertMany(docs);
    counts[name] = docs.length;
  }
  return counts;
}
