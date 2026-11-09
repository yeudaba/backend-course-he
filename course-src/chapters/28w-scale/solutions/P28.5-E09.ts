// P28.5-E09: תכנון קיבולת עם חוק Little
// L = λ × W : כמה בקשות "בתוך המערכת" בממוצע = קצב הגעה × זמן שהייה
export const inFlight = (rps: number, latencyMs: number): number => (rps * latencyMs) / 1000;

export function instancesNeeded({ peakRps, latencyMs, perInstance, headroom = 0.3, min = 2 }: { peakRps: number; latencyMs: number; perInstance: number; headroom?: number; min?: number }): number {
  if (!(headroom >= 0 && headroom < 1)) throw new Error("headroom בין 0 ל־1");
  const usable = perInstance * (1 - headroom); // לא מתכננים ל־100% — שם ה־latency מתפוצץ
  return Math.max(min, Math.ceil(inFlight(peakRps, latencyMs) / usable));
}

// כמה חיבורים למסד כל instance מחזיק, ואם כולם יחד חורגים מה־max_connections
export function checkDbConnections({ instances, poolPerInstance, maxConnections, reserved = 10 }: { instances: number; poolPerInstance: number; maxConnections: number; reserved?: number }) {
  const needed = instances * poolPerInstance;
  const available = maxConnections - reserved; // לאדמין, migrations, monitoring
  return { needed, available, ok: needed <= available, maxPoolPerInstance: Math.floor(available / instances) };
}
