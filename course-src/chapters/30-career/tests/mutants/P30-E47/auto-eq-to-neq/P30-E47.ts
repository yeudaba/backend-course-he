// P30-E47: סוד שנמחק — עדיין בהיסטוריה
type Commit = { sha: string; files: Record<string, string> };
type Finding = { kind: string; value: string; firstSha: string; stillPresent: boolean };

const RULES: [string, RegExp][] = [
  ["stripe", /sk_live_[A-Za-z0-9]{16,}/g],
  ["aws", /AKIA[A-Z0-9]{16}/g],
  ["github", /ghp_[A-Za-z0-9]{30,}/g],
];

function findAll(files: Record<string, string>): { kind: string; full: string }[] {
  const out: { kind: string; full: string; file: string; index: number }[] = [];
  for (const file of Object.keys(files).sort()) {
    for (const [kind, re] of RULES) {
      for (const m of files[file].matchAll(re)) out.push({ kind, full: m[0], file, index: m.index ?? 0 });
    }
  }
  return out.sort((a, b) => (a.file !== b.file ? a.index - b.index : a.file < b.file ? -1 : 1));
}

export function secretsInHistory(commits: Commit[]): Finding[] {
  const seen = new Map<string, { kind: string; firstSha: string }>();
  for (const c of commits) {
    for (const f of findAll(c.files)) if (!seen.has(f.full)) seen.set(f.full, { kind: f.kind, firstSha: c.sha });
  }
  const last = new Set(commits.length ? findAll(commits.at(-1)!.files).map((f) => f.full) : []);
  return [...seen].map(([full, s]) => ({ kind: s.kind, value: full.slice(0, 8) + "…", firstSha: s.firstSha, stillPresent: last.has(full) }));
}
