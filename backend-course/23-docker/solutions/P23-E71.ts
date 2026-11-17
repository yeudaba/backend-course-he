// P23-E71: lint ל־compose
const DB = /^(postgres|mysql|mongo|redis)\b/;

function envOf(env: unknown): Record<string, string> {
  if (Array.isArray(env)) {
    return Object.fromEntries(env.map((x: string) => {
      const i = x.indexOf("=");
      return i === -1 ? [x, ""] : [x.slice(0, i), x.slice(i + 1)];
    }));
  }
  return (env ?? {}) as Record<string, string>;
}

export function lintCompose(doc: any): string[] {
  const out: string[] = [];
  for (const [name, s] of Object.entries<any>(doc.services ?? {})) {
    const image: string | undefined = s.image;
    if (image !== undefined && ((!image.includes(":") && !image.includes("@")) || image.endsWith(":latest"))) out.push(`${name}: image בלי tag`);
    if (image && DB.test(image) && s.ports?.length) out.push(`${name}: מסד עם ports`);
    if (image?.startsWith("postgres:18") && (s.volumes ?? []).some((v: unknown) => typeof v === "string" && v.endsWith(":/var/lib/postgresql/data"))) {
      out.push(`${name}: volume של PostgreSQL 18 בנתיב הישן`);
    }
    if (Array.isArray(s.depends_on)) out.push(`${name}: depends_on בלי condition`);
    for (const [k, v] of Object.entries(envOf(s.environment))) {
      if (/localhost|127\.0\.0\.1/.test(String(v))) out.push(`${name}: localhost ב־${k}`);
    }
  }
  return out;
}
