// P26.3-E78: sync waves — מה קודם?
type Obj = { kind: string; metadata: { name: string; annotations?: Record<string, string> } };

const KINDS = ["Namespace", "ConfigMap", "Secret", "ServiceAccount", "Service", "Deployment", "Job", "CronJob", "Ingress"];
const rank = (k: string) => (KINDS.includes(k) ? KINDS.indexOf(k) : KINDS.length);

export function syncWaves(objs: Obj[]): string[][] {
  const waves = new Map<number, Obj[]>();
  for (const o of objs) {
    const raw = o.metadata.annotations?.["argocd.argoproj.io/sync-wave"] ?? "0";
    if (!/^-?\d+$/.test(raw.trim())) throw new Error(`sync-wave לא תקין ב־${o.kind}/${o.metadata.name}: ${raw}`);
    const w = Number(raw);
    waves.set(w, [...(waves.get(w) ?? []), o]);
  }
  return [...waves.keys()]
    .sort((a, b) => a - b)
    .map((w) =>
      waves
        .get(w)!
        .sort((a, b) => rank(a.kind) - rank(b.kind) || (a.metadata.name < b.metadata.name ? -1 : a.metadata.name > b.metadata.name ? 1 : 0))
        .map((o) => `${o.kind}/${o.metadata.name}`),
    );
}
