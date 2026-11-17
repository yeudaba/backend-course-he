// P23-E51: מה חשוב ב־docker inspect — בלי סודות
const SENSITIVE = /PASSWORD|SECRET|TOKEN|KEY/i;

export function summarize(inspect: any[]) {
  const c = inspect[0];
  if (!c) throw new Error("אין קונטיינר");
  const ports = Object.entries(c.HostConfig?.PortBindings ?? {})
    .flatMap(([port, binds]) => ((binds as any[]) ?? []).map((b) => `${b.HostIp || "0.0.0.0"}:${b.HostPort}->${port}`))
    .sort();
  const mounts = (c.Mounts ?? []).map((m: any) => (m.Type === "volume" ? `volume ${m.Name} → ${m.Destination}` : `bind ${m.Source} → ${m.Destination}`));
  const env: Record<string, string> = {};
  for (const s of c.Config?.Env ?? []) {
    const i = s.indexOf("=");
    const k = s.slice(0, i);
    env[k] = SENSITIVE.test(k) ? "***" : s.slice(i + 1);
  }
  return {
    name: String(c.Name).replace(/^\//, ""),
    image: c.Config.Image,
    running: c.State.Running,
    health: c.State.Health?.Status ?? null,
    ports,
    mounts,
    env,
  };
}
