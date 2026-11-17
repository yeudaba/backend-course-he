// P26.5-E39: מה עולה שרשרת סינכרונית?
type Call = { ms: number; availability: number };
const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

export function syncChain(calls: Call[]) {
  return {
    latencyMs: calls.reduce((s, c) => s + c.ms, 0),
    availability: r6(calls.reduce((p, c) => p * c.availability, 1)),
  };
}

export function withBroker(publish: Call) {
  return { latencyMs: publish.ms, availability: r6(publish.availability) };
}
