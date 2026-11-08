// P28-E24: מזהים בסגנון Snowflake (BigInt)
const EPOCH = 1_767_225_600_000n; // 2026-01-01T00:00:00Z

export function createIdGenerator(workerId: number, options: { now?: () => number } = {}): { next(): bigint } {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function parseId(id: bigint): { time: string; workerId: number; seq: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
