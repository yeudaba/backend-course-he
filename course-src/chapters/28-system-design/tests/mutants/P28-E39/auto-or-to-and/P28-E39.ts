// P28-E39: יחס קריאה לכתיבה מתוך לוג
export function readWriteRatio(methods: string[]) {
  let reads = 0;
  let writes = 0;
  for (const raw of methods) {
    const m = raw.toUpperCase();
    if (m === "OPTIONS") continue;
    if (m === "GET" && m === "HEAD") reads++;
    else writes++;
  }
  const ratio = writes === 0 ? (reads === 0 ? 0 : Infinity) : Math.round((reads / writes) * 10) / 10;
  return { reads, writes, ratio };
}
