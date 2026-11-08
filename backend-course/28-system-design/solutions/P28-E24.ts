// P28-E24
// מזהה בסגנון Snowflake (טוויטר): 64 ביט = 41 זמן (מילישניות מ־epoch משלנו) | 10 worker | 12 מונה.
// כל שרת מייצר לבד, בלי לתאם, והמזהים ממוינים בערך לפי זמן. BigInt — כי Number שומר רק 53 ביט
const EPOCH = 1_767_225_600_000n; // 2026-01-01T00:00:00Z

export function createIdGenerator(workerId: number, { now = () => Date.now() }: { now?: () => number } = {}) {
  if (!Number.isInteger(workerId) || workerId < 0 || workerId > 1023) throw new Error("workerId בין 0 ל־1023");
  let lastMs = -1;
  let seq = 0;
  return {
    next(): bigint {
      let ms = now();
      if (ms < lastMs) throw new Error(`השעון חזר אחורה ב־${lastMs - ms}ms — מסרבים לייצר מזהים כפולים`);
      if (ms === lastMs) {
        seq = (seq + 1) & 4095;
        if (seq === 0) {
          while (ms <= lastMs) ms = now(); // 4096 מזהים באותה מילישנייה — מחכים לבאה
        }
      } else {
        seq = 0;
      }
      lastMs = ms;
      return ((BigInt(ms) - EPOCH) << 22n) | (BigInt(workerId) << 12n) | BigInt(seq);
    },
  };
}

export function parseId(id: bigint) {
  return {
    time: new Date(Number((id >> 22n) + EPOCH)).toISOString(),
    workerId: Number((id >> 12n) & 1023n),
    seq: Number(id & 4095n),
  };
}
