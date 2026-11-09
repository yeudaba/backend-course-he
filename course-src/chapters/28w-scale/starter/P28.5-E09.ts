// P28.5-E09: תכנון קיבולת עם חוק Little
export const inFlight = (rps: number, latencyMs: number): number => {
  throw new Error("עוד לא כתבת את הפתרון");
};

export function instancesNeeded({ peakRps, latencyMs, perInstance, headroom = 0.3, min = 2 }: { peakRps: number; latencyMs: number; perInstance: number; headroom?: number; min?: number }): number {
  throw new Error("עוד לא כתבת את הפתרון");
}

export function checkDbConnections({ instances, poolPerInstance, maxConnections, reserved = 10 }: { instances: number; poolPerInstance: number; maxConnections: number; reserved?: number }): { needed: number; available: number; ok: boolean; maxPoolPerInstance: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
