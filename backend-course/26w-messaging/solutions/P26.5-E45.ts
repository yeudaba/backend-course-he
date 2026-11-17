// P26.5-E45: להודיע לכולם ב־HTTP — ולמה זה כואב
type Service = { name: string; call: (event: unknown) => Promise<void> };

export async function notifyAll(services: Service[], event: unknown, timeoutMs: number) {
  const timers: NodeJS.Timeout[] = [];
  const withTimeout = (p: Promise<void>) =>
    Promise.race([p, new Promise<never>((_, reject) => timers.push(setTimeout(() => reject(new Error("timeout")), timeoutMs)))]);
  const results = await Promise.allSettled(services.map((s) => withTimeout(Promise.resolve().then(() => s.call(event)))));
  timers.forEach(clearTimeout);
  return results.map((r, i) =>
    r.status === "fulfilled" ? { name: services[i].name, ok: true } : { name: services[i].name, ok: false, error: (r.reason as Error).message },
  );
}
