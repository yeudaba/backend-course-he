// P26.3-E76: הסטטוס של Application
type Res = { kind: string; name: string; spec: unknown; status?: any };

function canon(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (v !== null && typeof v === "object") {
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon((v as Record<string, unknown>)[k])}`).join(",")}}`;
  }
  return JSON.stringify(v);
}
const id = (r: Res) => `${r.kind}/${r.name}`;

export function appStatus(desired: Res[], live: Res[]) {
  const liveById = new Map(live.map((r) => [id(r), r]));
  const wanted = new Set(desired.map(id));
  const outOfSync: string[] = [];
  let missing = false;
  for (const d of desired) {
    const l = liveById.get(id(d));
    if (!l) missing = true;
    if (!l || canon(l.spec) !== canon(d.spec)) outOfSync.push(id(d));
  }
  for (const l of live) if (!wanted.has(id(l))) outOfSync.push(id(l));

  let health: "Healthy" | "Progressing" | "Degraded" | "Missing" = "Healthy";
  if (missing) health = "Missing";
  else {
    for (const d of desired.filter((r) => r.kind === "Deployment")) {
      const l = liveById.get(id(d))!;
      const s = l.status ?? {};
      const replicas = (l.spec as { replicas?: number })?.replicas ?? 1;
      if ((s.conditions ?? []).some((c: { reason?: string }) => c.reason === "ProgressDeadlineExceeded")) {
        health = "Degraded";
        break;
      }
      if ((s.updatedReplicas ?? 0) < replicas || (s.availableReplicas ?? 0) < replicas) health = "Progressing";
    }
  }
  return { sync: outOfSync.length ? ("OutOfSync" as const) : ("Synced" as const), health, outOfSync: outOfSync.sort() };
}
