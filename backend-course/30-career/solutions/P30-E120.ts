// P30-E120: לייבא את טבלת המעקב מ־CSV
type Row = { company: string; role: string; appliedOn: string; stage: string };
const STAGES = new Set(["applied", "screen", "interview", "offer", "rejected"]);

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function realDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function parseTrackerCsv(text: string) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const header = splitCsvLine(lines[0] ?? "");
  const col = (name: string) => header.indexOf(name);
  for (const name of ["company", "role", "applied_on", "stage"]) if (col(name) === -1) throw new Error(`חסרה עמודה: ${name}`);
  const rows: Row[] = [];
  const errors: { line: number; message: string }[] = [];
  lines.slice(1).forEach((line, i) => {
    if (!line.trim()) return;
    const n = i + 2;
    const f = splitCsvLine(line);
    if (f.length !== header.length) return void errors.push({ line: n, message: `${f.length} שדות, צריך ${header.length}` });
    const row = { company: f[col("company")], role: f[col("role")], appliedOn: f[col("applied_on")], stage: f[col("stage")] };
    if (!row.company) return void errors.push({ line: n, message: "company ריק" });
    if (!realDate(row.appliedOn)) return void errors.push({ line: n, message: `תאריך לא תקין: ${row.appliedOn}` });
    if (!STAGES.has(row.stage)) return void errors.push({ line: n, message: `שלב לא מוכר: ${row.stage}` });
    rows.push(row);
  });
  return { rows, errors };
}
