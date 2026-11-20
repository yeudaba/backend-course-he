// P28-E36: כמה שרתים צריך?
export function serversNeeded(peakRps: number, rpsPerServer: number, headroom = 0.3): number {
  if (!(rpsPerServer > 0)) throw new RangeError("rpsPerServer חייב להיות חיובי");
  if (!(peakRps >= 0)) throw new RangeError("peakRps לא תקין");
  if (!(headroom > 0 && headroom < 1)) throw new RangeError("headroom חייב להיות בין 0 ל־1 (לא כולל)");
  return Math.max(2, Math.ceil(peakRps / (rpsPerServer * (1 - headroom))));
}
