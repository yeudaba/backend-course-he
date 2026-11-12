// P26.5-E33: ack לפני או אחרי — לכל נקודת נפילה
type Step = "ack" | "handle";

export function crashOutcomes(order: Step[]) {
  if (order.length !== 2 || !order.includes("ack") || !order.includes("handle")) throw new RangeError("צריך בדיוק ack ו־handle");
  const counts: number[] = [];
  for (const crashAfter of [0, 1, 2, null]) {
    const done = crashAfter === null ? order : order.slice(0, crashAfter);
    let handled = done.filter((s) => s === "handle").length;
    if (crashAfter !== null && !done.includes("ack")) handled += 1; // נמסרת שוב, והפעם הכול עובר
    counts.push(handled);
  }
  const minHandled = Math.min(...counts);
  const maxHandled = Math.max(...counts);
  const guarantee = minHandled === 0 ? "at-most-once" : maxHandled > 1 ? "at-least-once" : "exactly-once";
  return { minHandled, maxHandled, guarantee } as const;
}
