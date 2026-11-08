// P28-E09: load balancer עם health checks
export function createBalancer(
  servers: readonly string[],
  options: { failThreshold?: number; recoverAfterMs?: number; now?: () => number } = {},
): { pick(): string | null; report(server: string, ok: boolean): void; healthy(): string[] } {
  throw new Error("עוד לא כתבת את הפתרון");
}
