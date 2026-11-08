// P19.5-E14: claimJobs — תור עבודות על טבלה, לכמה workers
import type { Pool } from "mysql2/promise";

export async function claimJobs(pool: Pool, workerId: string, limit: number): Promise<number[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}
