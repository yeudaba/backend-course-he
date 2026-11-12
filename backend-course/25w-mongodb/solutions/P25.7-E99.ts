// P25.7-E99: Idempotency-Key ב־Mongo
import { MongoServerError, type Db } from "mongodb";

type Rec = { _id: { userId: string; key: string }; fingerprint: string; status: "pending" | "done"; result?: unknown; createdAt: Date };

export async function runOnce<T>(db: Db, userId: string, key: string, fingerprint: string, fn: () => Promise<T>) {
  const col = db.collection<Rec>("idempotency");
  const _id = { userId, key };
  try {
    await col.insertOne({ _id, fingerprint, status: "pending", createdAt: new Date() });
  } catch (err) {
    if (!(err instanceof MongoServerError && err.code === 11000)) throw err;
    const existing = await col.findOne({ _id });
    if (!existing) throw new Error("IN_PROGRESS"); // נמחק בדיוק עכשיו — הלקוח ינסה שוב
    if (existing.fingerprint !== fingerprint) throw new Error("KEY_REUSED");
    if (existing.status === "pending") throw new Error("IN_PROGRESS");
    return { replayed: true, result: existing.result as T };
  }
  try {
    const result = await fn();
    await col.updateOne({ _id }, { $set: { status: "done", result } });
    return { replayed: false, result };
  } catch (err) {
    await col.deleteOne({ _id, status: "pending" });
    throw err;
  }
}
