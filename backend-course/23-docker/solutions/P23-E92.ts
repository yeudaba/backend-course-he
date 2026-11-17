// P23-E92: מה לא תקין ב־docker compose ps
type Row = { Service: string; State: string; Health: string; ExitCode: number };

export function problems(jsonLines: string, oneShot: string[]): string[] {
  const rows: Row[] = jsonLines.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
  const out: string[] = [];
  for (const r of rows) {
    if (oneShot.includes(r.Service)) {
      if (r.State === "exited" && r.ExitCode !== 0) out.push(`${r.Service}: נכשל (exit ${r.ExitCode})`);
      else if (r.State !== "exited") out.push(`${r.Service}: עדיין רץ`);
    } else if (r.State !== "running") out.push(`${r.Service}: ${r.State}`);
    else if (r.Health && r.Health !== "healthy") out.push(`${r.Service}: ${r.Health}`);
  }
  for (const name of oneShot) if (!rows.some((r) => r.Service === name)) out.push(`${name}: לא נמצא`);
  return out;
}
