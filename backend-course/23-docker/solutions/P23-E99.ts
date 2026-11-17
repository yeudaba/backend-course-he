// P23-E99: סודות שכתובים ישירות ב־compose
const SENSITIVE = /SECRET|PASSWORD|TOKEN|KEY/i;
const fromVar = (v: string) => /\$\{[^}]+\}|\$[A-Za-z_]/.test(v);

function envOf(env: unknown): [string, string][] {
  if (Array.isArray(env)) return env.map((x: string) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)]);
  return Object.entries((env ?? {}) as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]);
}

export function hardcodedSecrets(doc: any): string[] {
  const services: Record<string, any> = doc.services ?? {};
  const out: string[] = [];
  for (const [name, s] of Object.entries(services)) {
    const exposed = (s.ports ?? []).length > 0;
    for (const [k, v] of envOf(s.environment)) {
      if (fromVar(v)) continue;
      if (SENSITIVE.test(k)) {
        if (k === "POSTGRES_PASSWORD" && !exposed) continue;
        out.push(`${name}.${k}`);
      } else if (k === "DATABASE_URL" && /:\/\/[^:/@]+:[^@]+@/.test(v)) {
        let host = "";
        try {
          host = new URL(v).hostname;
        } catch {}
        if ((services[host]?.ports ?? []).length > 0) out.push(`${name}.DATABASE_URL`);
      }
    }
  }
  return out;
}
