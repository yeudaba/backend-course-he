// P24-E99: reserve עם P2002
export type Row = { id: number; fingerprint: string; status: number | null; body: unknown; createdAt: Date };
export type Db = {
  create(data: { userId: number; key: string; fingerprint: string; createdAt: Date }): Promise<void>;
  findUnique(userId: number, key: string): Promise<Row | null>;
  deleteById(id: number): Promise<void>;
};
export type Reservation = { kind: "new" } | { kind: "in_progress" } | { kind: "mismatch" } | { kind: "replay"; status: number; body: unknown };

const isUniqueViolation = (err: unknown) => typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";

export async function reserve(db: Db, userId: number, key: string, fingerprint: string, now: Date, ttlHours: number): Promise<Reservation> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await db.create({ userId, key, fingerprint, createdAt: now }); // האילוץ במסד מחליט מי "זוכה"
      return { kind: "new" };
    } catch (err) {
      if (!isUniqueViolation(err)) throw err; // תקלה אמיתית — לא "מישהו תפס"
    }
    const row = await db.findUnique(userId, key);
    if (!row) continue; // נמחק בין ה־create ל־find — עוד סיבוב
    if (row.createdAt.getTime() <= now.getTime() - ttlHours * 3_600_000) {
      await db.deleteById(row.id); // פג תוקף — כאילו לא קיים
      continue;
    }
    if (row.fingerprint !== fingerprint) return { kind: "mismatch" };
    if (row.status === null) return { kind: "in_progress" };
    return { kind: "replay", status: row.status, body: row.body };
  }
  return { kind: "in_progress" };
}
